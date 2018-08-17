

# composeMd


## 1、简介

composeMd 是通过递归指定目录下的文件夹寻找所有READMD.md文件，然后合并输出成单独一份READMD.md到指定目录
## 使用

```js
const composeMd = require('composeMd');

const rootPath = PATH.dirname(__filename);

composeMd(rootPath[,initString][,outputPath]); // 第一参数是需要递归的路径， 第二参数是初始字符串， 第三参数是输出的路径
```

