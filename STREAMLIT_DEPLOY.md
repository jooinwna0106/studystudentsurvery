# Streamlit 배포 방법

이 프로젝트는 React/Vite 사이트를 `streamlit_app.py`가 감싸서 Streamlit Cloud에 배포할 수 있게 구성되어 있습니다.

## 1. 배포 전 빌드

로컬에서 화면을 수정한 뒤 항상 빌드합니다.

```bash
npm run build
```

`streamlit_app.py`는 `dist` 폴더의 최신 빌드 파일을 읽어서 사이트를 표시합니다.

## 2. Streamlit Cloud 설정

Streamlit Cloud에서 새 앱을 만들 때:

- Main file path: `streamlit_app.py`
- Python requirements: `requirements.txt`

## 3. Advanced settings / Secrets

Streamlit Cloud의 Advanced settings 또는 Secrets에 아래 값을 넣습니다.

```toml
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
GEMINI_API_KEY = "your-gemini-api-key"
GEMINI_MODEL = "gemini-2.0-flash"
```

Supabase 테이블은 `supabase-schema.sql`을 Supabase SQL editor에서 먼저 실행해야 합니다.

## 4. 주의

이 앱은 브라우저에서 Supabase와 Gemini API를 호출합니다. 그래서 Streamlit Secrets에 넣은 Gemini API key도 최종적으로 브라우저에 전달됩니다. 실제 공개 서비스에서는 Gemini 호출을 서버 API로 프록시하는 방식이 더 안전합니다.
