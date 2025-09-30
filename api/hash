
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  
  const fileBuffer = readFileSync(join(process.cwd(), 'index.js'));
  const hash = createHash('sha256').update(fileBuffer).digest('hex');

  return res.status(200).json({
    hashset: 'on',   
    hashID: hash
  });
}
