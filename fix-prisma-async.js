const fs = require('fs');
const path = require('path');

// List of files that need to be updated
const filesToUpdate = [
  'src/routes/work-orders/[id]/+page.server.ts',
  'src/routes/work-orders/+page.server.ts',
  'src/routes/users/+page.server.ts',
  'src/routes/sites/[id]/+page.server.ts',
  'src/routes/sites/+page.server.ts',
  'src/routes/profile/+page.server.ts',
  'src/routes/dashboard/+page.server.ts',
  'src/routes/assets/[id]/+page.server.ts',
  'src/routes/assets/+page.server.ts',
  'src/routes/api/activity/+server.ts',
  'src/routes/+layout.server.ts'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all instances of "createRequestPrisma(" with "await createRequestPrisma("
    content = content.replace(/const prisma = createRequestPrisma\(/g, 'const prisma = await createRequestPrisma(');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Prisma async update complete!');