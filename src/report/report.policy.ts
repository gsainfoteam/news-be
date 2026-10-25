export const MAX_REPORT_FILES = 5;
export const MAX_REPORT_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// 업로드를 허용하는 확장자와 S3에 서명할 Content-Type
export const REPORT_FILE_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  txt: 'text/plain',
  hwp: 'application/x-hwp',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
};

// 업로드 URL 발급 때 서버가 만든 키만 받는다: report/{uuid}/{fileName}
export const REPORT_FILE_KEY_PATTERN =
  /^report\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z0-9_.-]+$/;
