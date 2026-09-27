cd c:\BD\server
call npm install -D prisma typescript ts-node @types/express @types/cors @types/node
call npm install @prisma/client express cors dotenv
call npx prisma generate
call npx prisma db push
