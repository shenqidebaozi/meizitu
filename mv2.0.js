/*
 * @Author: Baozi 
 * @Date: 2018-02-01 21:29:38 
 * @Last Modified by: Baozi
 * @Last Modified time: 2018-02-02 15:43:27
 */
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var request = require('request');
var url = 'http://www.mzitu.com/';
var dir = './images';
var lists = [];
var tjhref = [];
var getlist = async function (url) {
    return new Promise(function (resolve, reject) {
        request.get({
            url: url
        }, function (err, response, body) {
            var $ = cheerio.load(body);
            var list = $('ul#pins');
            list.find('li').each(function (item) {
                var tj = $(this);
                var tjhref = tj.find('a').attr('href');
                var tjname = tj.find('a').text();
                lists.push({
                    tjhref: tjhref,
                    tjname: tjname
                });
            });
            resolve(lists);
        });
    });
};
var getimglist = function (url, callback) {
    return new Promise(function (resolve, reject) {
        request.get({
            url: url
        }, function (err, response, body) {
            var $ = cheerio.load(body);
            var list = $('div.pagenavi');
            list.find('a').each(function (item) {
                var img = $(this);
                var href = img.find('span').text();
                tjhref[item] = href;
            });
            resolve(tjhref[tjhref.length - 2]);
        });
    });
};
var getimg = function (url, dir) {
    return new Promise(function (resolve, reject) {
        request.get({
            url: url
        }, function (err, response, body) {
            var href = '';
            var pic = '';
            var $ = cheerio.load(body);
            var list = $('div.main-image');
            list.find('p').each(function (item) {
                pic = $(this);
                href = pic.find('a').children('img').attr('src');
            });
            resolve(href);
        });
    });
};
var download = function (url, dir, filename) {
    return new Promise(function (resolve, reject) {
        var options = {
            uri: url,
            encoding: 'binary',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Host': 'i.meizitu.net',
                'If-Modified-Since': 'Wed, 17 Jan 2018 13:18:26 GMT',
                'If-None-Match': '5a5f4d22-21a86',
                'Referer': 'http://www.mzitu.com/116419/3',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
            }
        };
        request.get(options, function (err, response, body) {
            fs.writeFile(dir + '/' + filename + '.jpg', body, 'binary', function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
        resolve('o(*￣▽￣*)o偷偷下载' + dir + '/' + filename + ' done')
    });
};
var start = async function () {
    for (var m = 1; m <= 165; m++) {
        let result = await getlist('http://www.mzitu.com/' + m)
        for (var i in result) {
            let result1 = await getimglist(result[i].tjhref);
            fs.mkdir(result[i].tjname, 0777, function (err) {
            });
            console.log('创建目录：', result[i].tjname)
            console.log('该图集一共有：' + result1 + '张图片');
            for (var n = 1; n <= result1; n++) {
                let result2 = await getimg(result[i].tjhref + '/' + n);
                let result3 = await download(result2, result[i].tjname, n)
                console.log(result3);
            }
        }
    }
};
start();