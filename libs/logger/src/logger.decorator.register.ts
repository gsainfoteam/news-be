import { inspect } from 'util';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { LOGGABLE } from './decorator/loggable';

type AnyMethod = (...args: unknown[]) => unknown;

type InstanceWithMethods = {
  constructor: { name: string };
} & Record<string, unknown>;

@Injectable()
export class LoggerDecoratorRegister implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    return this.discoveryService
      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter((wrapper: InstanceWrapper) => {
        const metatype: unknown = wrapper.metatype;
        const instance: unknown = wrapper.instance;

        if (!instance || !metatype) {
          return false;
        }

        return Reflect.getMetadata(LOGGABLE, metatype);
      })
      .forEach((wrapper: InstanceWrapper) => {
        const instance: unknown = wrapper.instance;

        if (!instance || typeof instance !== 'object') {
          return;
        }

        const target = instance as InstanceWithMethods;

        this.metadataScanner.getAllMethodNames(target).forEach((methodName) => {
          const originalMethod = target[methodName];

          if (typeof originalMethod !== 'function') {
            return;
          }

          const logger = new Logger(target.constructor.name);

          const wrapped: AnyMethod = function (
            this: unknown,
            ...args: unknown[]
          ): unknown {
            const isSensitiveMethod =
              /(login|refresh|logout|register|issueToken)/i.test(methodName);
            const maskSensitiveData = (data: unknown): unknown => {
              if (data == null) return data;
              if (typeof data === 'string') {
                if (
                  isSensitiveMethod ||
                  data.startsWith('Bearer ') ||
                  data.startsWith('ey')
                ) {
                  return '***';
                }
                return data;
              }
              if (Array.isArray(data)) {
                return data.map((item) => maskSensitiveData(item));
              }
              if (typeof data === 'object') {
                const masked: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(data)) {
                  if (/(password|token|secret|auth)/i.test(key)) {
                    masked[key] = '***';
                  } else {
                    masked[key] = maskSensitiveData(value);
                  }
                }
                return masked;
              }
              return data;
            };

            const maskedArgs = maskSensitiveData(args);
            const argsStr = inspect(maskedArgs, {
              depth: 2,
              colors: false,
              breakLength: Infinity,
            });
            logger.log(`Before ${methodName}`);
            const now = Date.now();

            let result: unknown;
            try {
              result = (originalMethod as AnyMethod).apply(this, args);
            } catch (error) {
              logger.error(
                `Error in ${methodName} with args ${argsStr}: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : undefined,
              );
              throw error;
            }

            if (result instanceof Promise) {
              return result
                .then((resolvedResult: unknown) => {
                  logger.log(`After ${methodName} +${Date.now() - now}ms`);
                  return resolvedResult;
                })
                .catch((error: unknown) => {
                  logger.error(
                    `Error in ${methodName} with args ${argsStr}: ${error instanceof Error ? error.message : String(error)}`,
                    error instanceof Error ? error.stack : undefined,
                  );
                  throw error;
                });
            }

            logger.log(`After ${methodName} +${Date.now() - now}ms`);
            return result;
          };

          target[methodName] = wrapped;
        });
      });
  }
}
