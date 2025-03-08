const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// 千问API配置
const QIANWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// 千问API调用接口
app.post('/api/xxx', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '请提供prompt参数' });
    }

    const apiKey = process.env.QIANWEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '未配置千问API密钥' });
    }

    const response = await axios.post(QIANWEN_API_URL, {
      model: 'qwen-turbo',
      input: {
        prompt: prompt
      }
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('千问API调用失败:', error);
    res.status(500).json({ error: '调用千问API时发生错误' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});