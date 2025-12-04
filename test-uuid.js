// 测试UUID功能的脚本
const { v4: uuidv4 } = require('uuid');

// 测试UUID生成
console.log('UUID v4示例:');
for (let i = 0; i < 5; i++) {
    console.log(uuidv4());
}

// 验证UUID格式
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const testUuid = uuidv4();
console.log(`\n验证UUID格式 ${testUuid}:`);
console.log(`格式是否正确: ${uuidRegex.test(testUuid)}`);