var cheerio = require('cheerio'),
    request = require('request'),
    domain = require('domain'),
    async = require('async'),
    url = require('url');

var timeout = 15 * 1000;

var parsers = {

    'film.qq.com': function(u, callback){
        var id = url.parse(u).path.slice(9, 24);
        request(u, {timeout: timeout}, function(err, res, body){
            $ = cheerio.load(body);
            // TODO: 多地区
            // console.log('地区:', result.body.match(/<span class="item">地区：<a href="[\s\S]+?" _hot="cover.info.year" title="[\s\S]+?">([\s\S]+?)<\/a>/)[1]);
            var detail = $('.detail_all').text();
            if(detail.indexOf('简介：') === 0){
                detail = detail.slice(3);
            }
            callback(err, {
                id: id,
                name: $('.film_name').text(),
                view: u,
                origin: '腾讯好莱坞',
                director: $('[_hot="cover.info.director"]').text(),
                actor: [].slice.call($('.actor a').map(function(){return $(this).text()})),
                tag: [].slice.call($('[_hot="cover.bread_1"]').map(function(){return $(this).text()})),
                description: detail,
                poster: [$('meta[itemprop="image"]').attr('content').replace(/([\w\W]+?_)([\w]).jpg/, '$1a.jpg')]
            });
        }); 
    },


    'v.qq.com': function(u, callback){
        var path = url.parse(u).path,
            id = path.slice(9, 24);
        request(u, {timeout: timeout}, function(err, res, body){
            $ = cheerio.load(body);
            callback(err, {
                id: id,
                name: $('.intro_title h3 a').text(),
                view: u,
                origin: '腾讯视频',
                director: $('[_hot="cover3.detail.director"]').attr('title'),
                actor: [].slice.call($('.list_cont .name_list li[itemprop="actor"] a').map(function(){return $(this).attr('title')})),
                tag: [].slice.call($('.tag_list li meta').map(function(){return $(this).attr('content')})),
                description: $('.intro_full').text(),
                poster: [$('img[itemprop="image"]').attr('src')]
            });
        });
    }

};

var crawlAll = {
    'film.qq.com': function(all, one){
        request('http://film.qq.com/paylist/0/pay_-1_-1_-1_1_0_0_10000.html', function(err, res, body){
            $ = cheerio.load(body);
            var movieList = $('.movie_list li .cover_wrap');
            console.log('总数量:', movieList.length);
            var i = 0;
            async.mapLimit([].slice.call(movieList.map(function(i){
                var movie = $(this);
                var url = movie.attr('href'),
                    name = movie.attr('title');
                return {url: url, name: name};
            })), 20, function(data, next){
                // console.log('正在抓取第', ++i, '个:', data.name);
                var fn = function(){
                    crawl(data.url, function(err, result){
                        one && one(err, result);
                        next(err, result);
                    });
                };
                var errNum = 0;
                var d = domain.create();
                d.run(fn);
                d.on('error', function(err){
                    if(++errNum < 10){
                        setTimeout(function(){
                            d.run(fn);
                        }, 2000);
                    }else{
                        console.log(err);
                    }
                });

            }, function(err, results){
                all && all(err, results);
            });
        });
    }
}

function crawl(u, callback){
    var parser = parsers[url.parse(u).host];
    if(parser){
        parser(u, callback);
    }else{
        console.log('未匹配:', u);
        callback(null, null);
    }
}

module.exports = {
    parsers: parsers,
    crawl: crawl,
    crawlAll: crawlAll
};