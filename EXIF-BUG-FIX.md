# EXIF信息读取bug修复

## 问题
用户上传界面在上传图片后无法读取照片的EXIF信息。

## 原因
经过分析，发现是`exifr`库的API版本兼容性问题。该库的API已经更新，但前端和后端的代码仍然在使用旧版本的API调用方式。

具体来说，`exifr`版本7.1.3需要将解析字段列表放在`extract`选项中，而不是将其作为第二个参数直接传递。

## 修复方案
我已经修改了前后端的EXIF解析代码，将旧的API调用方式：

```javascript
exifr.parse(file, ['Make', 'Model', 'DateTimeOriginal', ...]);
```

替换为新的API调用方式：

```javascript
exifr.parse(file, { extract: ['Make', 'Model', 'DateTimeOriginal', ...] });
```

## 修复的文件
1. **前端**：`client/src/components/UploadForm.vue` - 修改了`hydrateFromExif`函数
2. **后端**：`server/src/controllers/photoController.js` - 修改了`extractExif`函数

## 验证
- 前端服务器已成功启动：http://localhost:5173
- 服务器端已经在运行：http://localhost:4000

## 测试方法
1. 访问前端页面：http://localhost:5173
2. 点击上传图片
3. 选择带有EXIF信息的JPEG图片
4. 上传后，系统应该自动填充相机型号、制造商、拍摄时间等EXIF信息

## 注意事项
1. PNG格式的图片不支持EXIF信息
2. 一些图片可能因为被处理过而丢失EXIF信息