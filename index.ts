import { Context, Random, Schema } from 'koishi';

export const name = 'keyword-response';

export interface Config {
  replies: {
    id: string; // 用户ID
    keyword: string; // 关键词
    responses: string[]; // 回复内容数组
  }[];
}

export const Config: Schema<Config> = Schema.object({
  replies: Schema.array(Schema.object({
    id: Schema.string().required().description('用户ID'),
    keyword: Schema.string().required().description('关键词'),
    responses: Schema.array(Schema.string().required().description("回复内容")).required().description('回复内容组(随机挑选)'),
  })
  ).required().description('回复组配置'),
});

export function apply(ctx: Context, config: Config) {
  ctx.middleware((session, next) => {
    // 遍历所有的回复配置
    for (const reply of config.replies) {
      // 检查用户ID和关键词
      if (session.userId === reply.id && session.content.includes(reply.keyword)) {
        // 从对应的回复中随机选择一个发送
        const response = Random.pick(reply.responses);
        session.send(response);
      }
    }
    return next();
  });
}
