# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p uploads logs

# 设置环境变量
ENV NODE_ENV=development
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "run", "dev"] 