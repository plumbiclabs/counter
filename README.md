# AI 语音功能调用服务器

这是一个基于 Express 的服务器，能够处理语音输入并调用 AI 大模型执行功能调用。

## 功能

- 接收语音文件和一组工具函数
- 将语音转换为文本
- 将文本和工具函数发送给大模型
- 获取并返回要调用的函数和传递的参数

## 安装

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产模式运行
npm start
```

## API 接口

### 语音功能调用

```
POST /api/voice-function-call
```

**请求格式**：multipart/form-data

**参数**:
- `audio`: 语音文件 (必须)
- `tools`: 工具函数列表 (必须), JSON 格式

**返回**:
```json
{
  "transcript": "语音转文字的结果",
  "functionCall": {
    "function": "要调用的函数名",
    "parameters": {
      "param1": "参数值1",
      "param2": "参数值2"
    }
  }
}
```

### 测试接口

```
GET /api/test
```

**返回**:
```json
{
  "status": "running",
  "timestamp": "2023-01-01T00:00:00Z",
  "apiKeyConfigured": true,
  "nodeVersion": "v18.15.0",
  "environment": "development"
}
```

## 环境变量

- `PORT`: 服务器端口号（默认：3000）
- `QIANWEN_API_KEY`: 千问 API 密钥

## 开发指南

### 语音转文字功能

在 `index.js` 文件中的 `/api/voice-function-call` 接口实现中，有一个待实现的语音转文字功能：

```javascript
// 1. 语音转文字（用户实现）
// TODO: 实现语音转文字功能
// const transcript = await speechToText(audioFile.path);
```

### 大模型调用功能

在 `index.js` 文件中的 `/api/voice-function-call` 接口实现中，有一个待实现的大模型调用功能：

```javascript
// 2. 调用大模型获取函数调用信息（用户实现）
// TODO: 实现大模型调用功能
// const functionCallResult = await callAIModel(transcript, tools);
``` 