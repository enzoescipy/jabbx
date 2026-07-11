# 1. 의존성 설치 레이어                                                                                                                 
FROM node:20-alpine AS deps                                                                                                             
WORKDIR /app                                                                                                                            
COPY package*.json ./                                                                                                                   
COPY prisma ./prisma/                                                                                                                   
RUN npm ci                                                                                                                                                                                   
                                                                                                                                                                                             
# 2. 빌드 레이어                                                                                                                        
FROM node:20-alpine AS builder                                                                                                                                                               
WORKDIR /app                                                                                                                                                                                 
COPY --from=deps /app/node_modules ./node_modules                                                                                       
COPY . .              

RUN npx prisma generate
RUN npm run build
                                                                                                                                                                                             
# 3. 실행 레이어 (초경량 프로덕션 이미지)                                                                                               
FROM node:20-alpine AS runner                                                                                                                                                                
WORKDIR /app                                                                                                                                                                                 
ENV NODE_ENV=production                                                                                                                 
                                                                                                                                                                                             
# 필요한 최소 파일만 복사                                                                                                                                                                    
COPY --from=builder /app/public ./public                                                                                                
COPY --from=builder /app/.next ./.next                                                                                                                                                       
COPY --from=builder /app/node_modules ./node_modules                                                                                    
COPY --from=builder /app/package.json ./package.json                                                                                    
COPY --from=builder /app/prisma ./prisma                                                                                                
                                                                                                                                        
EXPOSE 3000                                                                                                                             
ENV PORT=3000                                                                                                                           
ENV HOSTNAME="0.0.0.0"                                                                                                                  
                                                                                                                                        
# 실행 전 마이그레이션 적용 후 앱 실행                                                                                                  
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]