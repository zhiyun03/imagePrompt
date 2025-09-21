import { NextRequest, NextResponse } from 'next/server';

interface GeneratePromptRequest {
  fileId: string;
  promptType?: 'midjouney' | 'stableDiffusion' | 'flux' | 'normal';
  userQuery?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Generate prompt request received');

    const body = await request.json() as GeneratePromptRequest;
    console.log('Request body:', body);

    const { fileId, promptType = 'flux', userQuery = '请描述一下这个图片' } = body;

    if (!fileId) {
      console.error('File ID is missing');
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    console.log('Processing with:', { fileId, promptType, userQuery });

    const cozeApiToken = process.env.COZE_API_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;

    if (!cozeApiToken || !workflowId) {
      return NextResponse.json(
        { error: 'Coze API token or workflow ID not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeApiToken}`,
        'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: {
          userQuery,
          img: JSON.stringify({ file_id: fileId }),
          promptType,
        },
      }),
    });

    const result = await response.json();

    if (result.code !== 0) {
      return NextResponse.json(
        { error: result.msg || 'Failed to generate prompt' },
        { status: 500 }
      );
    }

    const outputData = JSON.parse(result.data);

    return NextResponse.json({
      output: outputData.output,
      usage: result.usage,
      debugUrl: result.debug_url,
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}