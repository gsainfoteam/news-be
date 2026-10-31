CREATE TABLE "about" (
	"id" serial PRIMARY KEY NOT NULL,
	"introduction" text NOT NULL,
	"founded_at" date NOT NULL,
	"publisher" text NOT NULL,
	"director" text NOT NULL,
	"editor_in_chief" text NOT NULL,
	"address" text NOT NULL,
	"email" text NOT NULL,
	"homepage" text NOT NULL,
	"instagram" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "history" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
INSERT INTO "about" ("introduction", "founded_at", "publisher", "director", "editor_in_chief", "address", "email", "homepage", "instagram") VALUES (
	'학내 독립언론 지스캐치는 2015년 한 해 동안 대학, 사회관련 소식을 전해왔다.
2016년 지스캐치는 발행인 문승현 총장, 주간 이용주 교수, 부주간 장진호 교수를 두고 4월 11일 창간호 발행을 시작으로 학내 공식 언론사 ''지스트신문''으로 새롭게 창간하였다.
현재 주간 홍성민 교수를 두고 연 6회 지면발행하고 있다.',
	'2016-04-11',
	'임기철',
	'홍성민',
	'이다연',
	'광주광역시 북구 첨단과기로 123 제1학생회관 3층 GIST 신문사',
	'editor@gist.ac.kr',
	'https://www.gistnews.co.kr',
	'https://www.instagram.com/gistnews._.official'
);
--> statement-breakpoint
INSERT INTO "history" ("date", "content") VALUES
	('2015-02-10', '학내독립언론 지스캐치 창간'),
	('2016-04-11', '지스트 공식 언론 지스트신문 창간호 발행. 발행인 문승현 총장, 주간 이용주 교수, 부주간 장진호 교수'),
	('2016-05-31', '지스트신문 3호 발행을 마지막으로 백승혁(14, 기계) 편집장 사임, 김수호(15, 물리) 책임기자가 편집장 취임'),
	('2017-04-10', '주간 최정옥 교수'),
	('2017-06-30', '지스트신문 11호 발행을 마지막으로 김수호(15, 물리) 편집장 사임, 박정기(16, 기초) 책임기자가 편집장 취임'),
	('2017-09-20', '주간 최정옥 교수'),
	('2018-05-30', '지스트신문 19호 발행을 마지막으로 박정기(16, 전전컴) 편집장 사임, 박세현(17, 기초) 정기자가 편집장 취임'),
	('2019-03-11', '지스트신문 24호 발행을 마지막으로 박세현(17, 기초) 편집장 사임, 남유성(18, 기계) 정기자가 편집장 취임'),
	('2019-12-02', '주간 김근영 교수'),
	('2020-03-18', '지스트신문 31호 발행을 마지막으로 남유성(18, 기계) 편집장 사임, 고송주(19, 기계) 정기자가 편집장 취임'),
	('2021-03-10', '지스트신문 38호 발행을 마지막으로 고송주(19, 기계) 편집장 사임, 최은기(20, 전전컴) 책임기자가 편집장 취임'),
	('2021-03-15', '주간 이주형 교수'),
	('2022-03-04', '지스트신문 45호 발행을 마지막으로 최은기(20, 전전컴) 편집장 사임, 이은찬(21, 물리) 정기자가 편집장 취임'),
	('2022-12-02', '지스트신문 50호 발행'),
	('2023-03-08', '지스트신문 51호 발행을 마지막으로 이은찬(21, 물리) 편집장 사임, 김성우(22, 환경) 정기자가 편집장 취임'),
	('2023-03-15', '주간 홍성민 교수'),
	('2024-04-08', '지스트신문 56호 발행을 마지막으로 김성우(22, 환경) 편집장 사임, 김도은(23, 환경) 정기자가 편집장 취임'),
	('2025-04-01', '지스트신문 61호 발행을 마지막으로 김도은(23, 환경) 편집장 사임, 김민석(24, 화학) 정기자가 편집장 취임'),
	('2026-03-12', '지스트신문 68호 발행을 마지막으로 김민석(24, 화학) 편집장 사임, 이다연(25, 화학) 정기자가 편집장 취임');
