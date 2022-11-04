#!/bin/bash

# Script to copy static assets related to Monaco editor during build.

function find_monaco_path() {
  editor_main_js_path=$(node -e 'console.log(require.resolve("monaco-editor/esm/vs/editor/editor.main.js"));')
  if [ $? -ne 0 ]; then
    echo 'Could not find monaco-editor in node_modules'
    exit 1
  fi
  echo "${editor_main_js_path}" | sed 's|/esm/vs/editor/editor.main.js$||'
}

cd "$(dirname "$0")/../../"

monaco_path=$(find_monaco_path)
echo "Copying assets from ${monaco_path}"

(set -x; \
    mkdir -p ./public/monaco/vs/base{,/common}/worker && \
    cp "${monaco_path}"/min/vs/base/worker/workerMain.js ./public/monaco/vs/base/worker/ && \
    cp "${monaco_path}"/min/vs/base/common/worker/simpleWorker.nls.js ./public/monaco/vs/base/common/worker/)
