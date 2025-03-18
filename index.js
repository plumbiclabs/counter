const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai'); // 新增OpenAI客户端依赖

const app = express();
const cors = require('cors');

// 在所有路由之前启用CORS
app.use(cors({
  origin: 'http://localhost:3000', // 或使用 '*' 允许所有源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 配置OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-7edf1ddb970f40e58a9db250d67e4af0", // 默认使用环境变量，如果没有则使用提供的Key
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" // 阿里云兼容模式地址
});

// 配置system prompt
const SYSTEM_PROMPT = "你是一个很有帮助的公共澡堂（浴室）收银助手。用户会创建订单，添加服务项目，收款和结账等。你需要遵循以下几个规则：1）我有一套手牌，每个手牌具有一个唯一的数字。2）每个客人会在进入浴场时发一个手牌，客人所消费项目都会记录在这个手牌上。3）收银台会通过查询手牌关联项目，为客人结账";


// 配置multer用于处理文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 新接口：调用大模型进行函数调用
app.post('/api/llm', async (req, res) => {
  try {
    const { text, tools } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: '没有提供文本内容' 
      });
    }
    
    if (!tools || !Array.isArray(tools)) {
      return res.status(400).json({ 
        success: false, 
        message: '工具函数格式不正确' 
      });
    }
    
    console.log('接收到的文本:', text);
    console.log('接收到的工具函数:', JSON.stringify(tools));
    
    // 构建消息数组
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: text
      }
    ];
    
    // 调用大模型
    const completion = await openai.chat.completions.create({
      model: "qwen-plus", // 使用千问plus模型
      messages: messages,
      tools: tools
    });
    
    console.log('大模型返回结果:', JSON.stringify(completion.choices[0].message));
    
    // 检查是否有工具调用
    if (completion.choices[0].message.tool_calls && 
        completion.choices[0].message.tool_calls.length > 0) {
      
      // 获取函数调用信息
      const function_name = completion.choices[0].message.tool_calls[0].function.name;
      const arguments_string = completion.choices[0].message.tool_calls[0].function.arguments;
      
      // 解析参数为JSON对象
      let arguments_json;
      try {
        arguments_json = JSON.parse(arguments_string);
      } catch (e) {
        arguments_json = { raw: arguments_string };
      }
      
      // 返回成功响应
      return res.json({
        success: true,
        message: 'LLM处理成功',
        response: {
          function: function_name,
          parameters: arguments_json
        }
      });
    } else {
      // 如果没有工具调用，返回普通回复
      return res.json({
        success: true,
        message: 'LLM返回了普通回复',
        response: {
          text: completion.choices[0].message.content
        }
      });
    }
    
  } catch (error) {
    console.error('LLM调用失败:', error);
    res.status(500).json({ 
      success: false, 
      message: 'LLM调用过程中发生错误: ' + error.message 
    });
  }
});

// 处理语音和工具函数调用的接口
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // 获取上传的语音文件
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({ error: '没有提供语音文件' });
    }

    // 1. 语音转文字 - 调用百度语音识别API
    // 读取音频文件并转换为base64格式
    const fileContent = fs.readFileSync(audioFile.path);
    const speech_base64 = fileContent.toString('base64');
    const speechLength = fileContent.length;

    // 调用百度语音识别API
    const options = {
      'method': 'POST',
      'url': 'https://vop.baidu.com/server_api',
      'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: JSON.stringify({
        "format": "wav",
        "rate": 16000,
        "channel": 1,
        "cuid": "nvMJJ2TFbexzWPmpMEJSW1B6kLf02t4n",
        "token": "24.d7c6a2db7a970d762e62fe23769cb0bb.2592000.1742365463.282335-52905418",
        "speech": speech_base64,
        "len": speechLength
      })
    };
    // 发送请求到百度API
    const baiduResponse = await axios(options);
    const transcript = baiduResponse.data.result[0];
    console.log('语音识别结果:', transcript);

    // 返回结果
    res.json({
      success: true,
      data: transcript,
    });

  } catch (error) {
    console.error('处理失败:', error);
    res.status(500).json({
      success: false,
      error: '处理请求时发生错误'
    });
  }
});

// 测试API接口
app.get('/api/test', (req, res) => {
  const apiKey = process.env.QIANWEN_API_KEY;
  const serverStatus = {
    status: 'running',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!apiKey,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(serverStatus);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
