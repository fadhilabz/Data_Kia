// components/anct/table/AnctTableHeader.jsx
'use client';

import { ANCT_FIELDS } from '@/constants/anctFields';

function buildHeaderRuns(fields) {
  const runs = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    let j = i;
    const groupFields = [];
    while (j < fields.length && fields[j].group === f.group) {
      groupFields.push(fields[j]);
      j++;
    }
    runs.push({ group: f.group, fields: groupFields });
    i = j;
  }
  return runs;
}

export default function AnctTableHeader() {
  const headerRuns = buildHeaderRuns(ANCT_FIELDS);

  return (
    <thead className="sticky top-0 z-10 bg-emerald-50">
      <tr>
        <th rowSpan={2} className="border border-gray-300 px-2 py-2 min-w-[2.5rem] bg-emerald-100">
          NO
        </th>
        <th rowSpan={2} className="border border-gray-300 px-3 py-2 min-w-[12rem] bg-emerald-100 text-left">
          NAMA PUSKESMAS
        </th>
        {headerRuns.map((run, idx) => (
          <th
            key={`group-${idx}`}
            colSpan={run.fields.length}
            className="border border-gray-300 px-2 py-2 bg-emerald-100"
          >
            {run.group}
          </th>
        ))}
      </tr>
      <tr>
        {ANCT_FIELDS.map((field) => (
          <th key={field.key} className="border border-gray-300 px-2 py-1 bg-emerald-50 min-w-[6rem]">
            {field.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}