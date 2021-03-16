/** Script to extract statement & function references to Airtable. */

import Airtable from 'airtable';
import {program} from 'commander';
import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';

const REFERENCE_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'docs',
  'Microsoft QuickBASIC BASIC: Language Reference.txt'
);
const REFERENCE_START_LINE = 2864;
const REFERENCE_END_LINE = 19086;
const ACTION_REGEX = /■ Action\n([^■]+)(?=\n■ )/;
const SYNTAX_REGEX = /■ Syntax(?: [^\n]*)?\n([^■]+)(?=\n■ )/;
const REMARKS_REGEX = /^\n*■ Remarks\n*/;

function isSep(line: string) {
  return line.match(/^[─]+$/);
}

function findNextName(lines: Array<string>, startLineIdx: number) {
  let lineIdx = startLineIdx;
  let name = '';
  for (;;) {
    // Find initial separator line.
    while (lineIdx < lines.length && !isSep(lines[lineIdx])) {
      ++lineIdx;
    }
    if (lineIdx >= lines.length - 3) {
      return null;
    }
    // Next line is the name.
    name = lines[++lineIdx];
    // If next line is separator, we've found a name.
    if (isSep(lines[++lineIdx])) {
      return {name, descLineIdx: lineIdx + 1};
    }
    // Otherwise, keep going.
    ++lineIdx;
  }
}

if (require.main === module) {
  (async () => {
    program
      .requiredOption('--api-key <API key>', 'Airtable API key')
      .requiredOption('--base <Base ID>', 'Airtable base ID')
      .requiredOption('--table <Table ID>', 'Airtable table ID')
      .parse();
    const opts = program.opts();

    try {
      const lines = (await fs.readFile(REFERENCE_FILE_PATH, 'utf-8'))
        .split(/\r?\n/)
        .slice(REFERENCE_START_LINE - 1, REFERENCE_END_LINE - 1);

      const records: Array<{
        name: string;
        action: string;
        syntax: string;
        desc: string;
      }> = [];
      let lineIdx = 0;
      for (;;) {
        // 1. Parse name.
        const nextName = findNextName(lines, lineIdx);
        if (nextName === null) {
          break;
        }
        const {name} = nextName;
        lineIdx = nextName.descLineIdx;

        // 2. Parse description.
        const descStartLineIdx = lineIdx;
        while (lineIdx < lines.length && !isSep(lines[lineIdx])) {
          ++lineIdx;
        }
        const descEndLineIdx = lineIdx;
        let desc = lines
          .slice(descStartLineIdx, descEndLineIdx)
          .join('\n')
          .trim();

        let action = '';
        const actionMatch = desc.match(ACTION_REGEX);
        if (actionMatch) {
          action = actionMatch[1].trim().replace(/\n\s*/g, ' ');
          desc = desc.replace(ACTION_REGEX, '');
        }

        let syntaxList: Array<string> = [];
        for (;;) {
          const syntaxMatch = desc.match(SYNTAX_REGEX);
          if (syntaxMatch) {
            syntaxList.push(syntaxMatch[1].trim().replace(/\n\s*/g, '\n'));
            desc = desc.replace(SYNTAX_REGEX, '');
          } else {
            break;
          }
        }
        const syntax = ['```', ...syntaxList, '```'].join('\n');

        desc = desc.replace(REMARKS_REGEX, '');

        desc = ['```', desc, '```'].join('\n');

        records.push({name, desc, action, syntax});
      }

      console.log(`Found ${records.length} records`);

      const recordsToCreate: Array<{
        fields: {
          Name: string;
          Description: string;
          Action: string;
          Syntax: string;
        };
      }> = [];
      const recordsToUpdate: Array<{
        id: string;
        fields: {Description: string; Action: string; Syntax: string};
      }> = [];
      const airtable = new Airtable({apiKey: opts.apiKey});
      const table = airtable.base(opts.base)(opts.table);

      const existingRecords = await table.select().all();
      for (const {name, action, syntax, desc} of records) {
        const existingRecord = existingRecords.find(
          (existingRecord) => existingRecord.get('Name') === name
        );
        if (existingRecord) {
          recordsToUpdate.push({
            id: existingRecord.id,
            fields: {Description: desc, Action: action, Syntax: syntax},
          });
        } else {
          recordsToCreate.push({
            fields: {
              Name: name,
              Description: desc,
              Action: action,
              Syntax: syntax,
            },
          });
        }
      }

      if (recordsToUpdate.length > 0) {
        console.log(`Updating ${recordsToUpdate.length} records`);
        for (const chunk of _.chunk(recordsToUpdate, 10)) {
          await table.update(chunk);
        }
      }
      if (recordsToCreate.length > 0) {
        console.log(`Inserting ${recordsToCreate.length} records`);
        for (const chunk of _.chunk(recordsToCreate, 10)) {
          await table.create(chunk);
        }
      }
    } catch (e) {
      console.error(`Got error: ${e.message ?? JSON.stringify(e)}`);
    }
  })();
}
