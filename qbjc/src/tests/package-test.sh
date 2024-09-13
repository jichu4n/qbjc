#!/bin/bash
#
# Smoke test for verifying the published package. It runs `npm pack` and
# verifies the output can be installed and imported.
#

TEST_SCRIPT=$(cat <<'EOF'

import assert from 'assert';
import {compile} from 'qbjc';
import {NodeExecutor} from 'qbjc/node';

async function testCompileAndRun(source: string) {
  const {code} = await compile({
    source,
    sourceFileName: 'test.bas',
  });
  assert(code);
  await new NodeExecutor().executeModule(code);
}

(async () => {
  await testCompileAndRun('PRINT "Hello, World!"');
})();

EOF
)
SOURCE_DIR="$PWD"
TEMP_DIR="$PWD/../tmp-smoke-test"


cd "$SOURCE_DIR"
echo "> Building package"
npm pack || exit 1
echo

package_files=(*.tgz)
if [ ${#package_files[@]} -eq 1 ]; then
  package_file="$SOURCE_DIR/${package_files[0]}"
  echo "> Found package $package_file"
	echo
else
	echo "Could not identify package file"
	exit 1
fi

echo "> Installing package in temp directory $TEMP_DIR"
if [ -d "$TEMP_DIR" ]; then
  rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"
npm init -y
npm install --save ts-node typescript '@types/node' "$package_file"
echo '{ "compilerOptions": { "module": "CommonJS", "esModuleInterop": true } }' > tsconfig.json
echo

echo "> Running test script"
echo "$TEST_SCRIPT"
if ./node_modules/.bin/ts-node -e "$TEST_SCRIPT"; then
  echo
	echo "> Success!"
	exit_code=0
else
  exit_code=$?
  echo
	echo "> Error - script returned status ${exit_code}"
fi
echo

echo "> Cleaning up"
cd "$SOURCE_DIR"
rm -rf "$TEMP_DIR" "$package_file"

exit $exit_code
