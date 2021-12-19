jQuery.fn.extend({
    layTableScroll:function (){
        $(this).each(function() {
            var _this=$(this);//存储对象
            var ul = _this.find("tbody");
            var li= ul.find("tr");
            var h = li.length * li.height();
            if (h <= _this.height()) return
            li.clone().prependTo(ul);

            ul.height(2*h);
            var i=1,l;
            _this.hover(function(){i=0},function(){i=1});
            function autoScroll(){
                l = _this.scrollTop();
                if(l>=h){
                    _this.scrollTop(0);
                }else{
                    _this.scrollTop(l + i);
                }
                requestAnimationFrame(autoScroll)
            }
            requestAnimationFrame(autoScroll);
        })
    }
});

function screenFun(num) {
    num = num || 1;
    num = num * 1;
    var docElm = document.documentElement;

    switch (num) {
        case 1:
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
            break;
        case 2:
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            break;
    }

    return new Promise(function (res, rej) {
        res("返回值");
    });
}

// 加载首页
$("#header").load('_header.html',undefined, function (response, status) {
    if (status == 'success') {
        var pathname = location.pathname.substring(1)
        if (pathname == '') {
            return
        }
        $("header .nav_item").siblings().removeClass("active")
        $(`a[href='${pathname}']`).parent().addClass("active")
        // .eq(1).addClass("active")
    }
})


// 图表上标题导航 tab
$(".nav_tit").on("click", function() {
    var index = $(this).index()
    $(this).parent().children().removeClass("active")
    $(this).addClass("active")
    var parent = $(this).parent().parent()
    parent.find(".nav_tab_content").hide().eq(index).show()
    Charts[parent.find('.normal_chart').eq(index).attr("id")].resize()
})

// 自定义 modal
Date.prototype.pattern=function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "\u65e5",
        "1" : "\u4e00",
        "2" : "\u4e8c",
        "3" : "\u4e09",
        "4" : "\u56db",
        "5" : "\u4e94",
        "6" : "\u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}