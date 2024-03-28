import { Context, Random, Schema } from 'koishi';

export const name = 'keyword-response';

export const usage = `
<h2>有什么用</h2>
请你在配置文件中添加一些关键词和回复内容，当指定用户发送的消息中包含关键词时，将会随机回复一个内容给用户。
例如著名八嘎家上学大人，可以在用户id中填写上学的id，关键词中填写“八嘎”，在回复组中填写“八嘎！”“bakabaka！” 即可随机选取一个进行回复。

<h3>当然你也可以选择所有用户，只需要在用户id项选择填写为*即可，这样关键词回复将会对所有的用户生效。</h3>(慎用)
`;
export interface Config {
  replies: {
    id: string[] | '*'; // 用户ID数组或'*'代表所有用户
    keyword: string[]; // 关键词数组
    responses: string[]; // 回复内容数组
  }[];
}

export const Config: Schema<Config> = Schema.object({
  replies: Schema.array(Schema.object({
    id: Schema.union([
      Schema.array(Schema.string()).required(),
      Schema.const('*').required(),
    ]).required().description('用户ID数组或"*"代表所有用户'),
    keyword: Schema.array(Schema.string()).required().description('关键词数组'),
    responses: Schema.array(Schema.string().required().description("回复内容")).required().description('回复内容组(随机挑选)'),
  })
  ).required().description('回复组配置'),
});

export function apply(ctx: Context, config: Config) {
  ctx.middleware((session, next) => {
    // 遍历所有的回复配置
    for (const reply of config.replies) {
      // 检查是否针对所有用户或特定用户ID
      const isForAllUsers = reply.id === '*' || reply.id.includes(session.userId);
      // 检查关键词
      const keywordMatched = reply.keyword.some(keyword => session.content.includes(keyword));
      // 当id为'*'或特定用户ID，并且关键词匹配时，发送回复
      if (isForAllUsers && keywordMatched) {
        // 从对应的回复中随机选择一个发送
        const response = Random.pick(reply.responses);
        session.send(response);
        return; // 找到匹配项后停止遍历并响应
      }
    }
    return next();
  });
}
