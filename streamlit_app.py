from __future__ import annotations

import base64
import json
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


ROOT = Path(__file__).parent
DIST = ROOT / "dist"
ASSETS = DIST / "assets"
ROBOT = ROOT / "public" / "assets" / "study-robot-transparent.png"


def secret(name: str, fallback: str = "") -> str:
    try:
        return str(st.secrets.get(name, fallback))
    except Exception:
        return fallback


def first_asset(extension: str) -> Path:
    matches = sorted(ASSETS.glob(f"*.{extension}"))
    if not matches:
        raise FileNotFoundError(f"Build asset not found: dist/assets/*.{extension}")
    return matches[0]


def data_url(path: Path, mime_type: str) -> str:
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def render_site() -> None:
    config = {
        "supabaseUrl": secret("SUPABASE_URL") or secret("VITE_SUPABASE_URL"),
        "supabaseAnonKey": secret("SUPABASE_ANON_KEY") or secret("VITE_SUPABASE_ANON_KEY"),
        "geminiApiKey": secret("GEMINI_API_KEY") or secret("VITE_GEMINI_API_KEY"),
        "geminiModel": secret("GEMINI_MODEL", "gemini-2.0-flash") or "gemini-2.0-flash",
    }

    css = first_asset("css").read_text(encoding="utf-8")
    js = first_asset("js").read_text(encoding="utf-8")
    robot_src = data_url(ROBOT, "image/png")
    js = js.replace("/assets/study-robot-transparent.png", robot_src)

    html = f"""
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body, #root {{
            margin: 0;
            min-height: 100%;
            overflow-x: hidden;
          }}
          {css}
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.__STUDY_AI_CONFIG__ = {json.dumps(config)};
        </script>
        <script type="module">
          {js}
        </script>
      </body>
    </html>
    """

    components.html(html, height=1200, scrolling=True)


st.set_page_config(page_title="study.ai", page_icon="🤖", layout="wide")
render_site()
