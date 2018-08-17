// 合成md文件脚本 
// 适用Mac系统
// 建议用 node 7.0 以上

const asyncReduce = require('async-reduce-p');

const PATH = require('path');

const fs = require('fs');

module.exports = function composeMd(rootPath,initString,outputPath){
  if (initString === undefined) initString = '';
  if (outputPath === undefined) outputPath = PATH.join(rootPath,'README.md');
  return _composeMd(rootPath,initString,rootPath).then((data)=>{
    return writeData(outputPath,data);
  }).catch(err=>console.log(err));

  function _composeMd(path,string,rootPath){

    return readdirP(path).then(
      files => statPAll(files,path),
      err => console.log(err)
    )
    .then(l=>findMdAndDir(l,path,string,rootPath,outputPath))
    .then(returner=>{
      const {md,dirs} = returner;
      return asyncReduce(dirs,(pre,cur)=>{
        return _composeMd(cur.path,pre,rootPath);
      },md)
    });
  }
}

function writeData(path,data){
  return writeFileP(path,data);
}

function statPAll(files,path){
  return Promise.all(
    files.map(file=>{
      const _path = PATH.join(path,file);
      return statP(_path).then((stats)=>{return {file,path:_path,isFile:stats.isFile()}});
    })
  );
}

function findMdAndDir(list,path,string,rootPath,outputPath) {
  const ignoreDirName = ['output','.git','images','node_modules'];
  const files = list.filter(item=>item.isFile === true);
  const dirs = list.filter(item=>item.isFile === false && ignoreDirName.indexOf(item.file) === -1);
  if (path === rootPath) {
    return {
      md:string + '\n',
      dirs
    }
  } else {
    const readme = files.filter(item=>item.file === 'README.md')[0];
    if (readme === undefined)  return {md:string + '\n',dirs}
    return readFileP(readme.path,{encoding:'utf-8'}).then(
      bytesRead=>{
        return { 
            dirs,
            md:string + '\n' + fixedImagePath(bytesRead,PATH.dirname(readme.path),PATH.dirname(outputPath))
          }
      }
    )
  }
}

function fixedImagePath(bytesRead,dirname,outputDirname){
  const regexImgTag = /\!\[.+\]\(.+\)/g;
  const regex2ImgPath = /\]\(.+\)/;
  function replaceImgPath(match){
    return match.replace(regex2ImgPath,composedPath)
  }
  function composedPath(math){
    const path = math.slice(2,-1);
    const absolutePath = PATH.join(dirname,path);
    const relativePath = PATH.relative(outputDirname,absolutePath);
    return `](${relativePath})`;
  }
  return bytesRead.replace(regexImgTag,replaceImgPath);
}

function writeFileP(path,data){
  return new Promise((resolve, reject)=>{
    fs.writeFile(path,data,function(err){
      if(err){
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
}


function readFileP(path,mode){
  // console.log(path);
  return new Promise((resolve, reject)=>{
    fs.readFile(path,mode,function(err,bytesRead){
      if(err){
        return reject(err);
      } else {
        return resolve(bytesRead);
      }
    });
  });
}


function statP(path){
  return new Promise((resolve, reject)=>{
    fs.stat(path,function(err,stats){
      if(err){
        return reject(err);
      } else {
        return resolve(stats);
      }
    });
  });
}

function readdirP(path){
  return new Promise((resolve, reject)=>{
    fs.readdir(path,function(err,files){
      if(err){
        return reject(err);
      } else {
        return resolve(files);
      }
    });
  });
}