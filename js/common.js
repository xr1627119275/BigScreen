var splitLineColor = 'rgba(54,192,197,0.3)'
jQuery.fn.extend({
    layTableScroll:function (){
        $(this).each(function() {
            var _this=$(this);//存储对象
            var ul = _this.find("tbody");
            var li = ul.find("tr");
            var h = 0;
            li.each(function (i, item) {
                h += $(item).height()
            })

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



/*获取指定日期*/
function getDay(day) {
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds); //注意，这行是关键代码
    var tYear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = doHandleMonth(tMonth + 1);
    tDate = doHandleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
}

function getNextYearDay(day) {
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds); //注意，这行是关键代码
    var tYear = today.getFullYear()+1;
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    tMonth = doHandleMonth(tMonth + 1);
    tDate = doHandleMonth(tDate);
    return tYear + "-" + tMonth + "-" + tDate;
}

function doHandleMonth(month) {
    var m = month;
    if (month.toString().length == 1) {
        m = "0" + month;
    }
    return m;
}

publicUrl = 'http://61.190.7.13:9410/mdm/'
var publicAjax = function (types, urls, params, asyncs, header, callback, error) {
    var async_val = true, header_val = {"Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbklkIjoiMSIsImxvZ2luTmFtZSI6IkFkbWluaXN0cmF0b3IiLCJpc3MiOiJjdGNlYWRtaW5zdHJhdG9yIn0.4ztrsoEczkasFe2meS5oASG372rc8zsdFaPG8FjH8Ho"}, type_val = 'post';
    if (asyncs != null) {
        async_val = asyncs;
    }
    if (header != null) {
        header_val = header;
    }
    if (types != null) {
        type_val = types;
    }
    $.ajax({
        type: type_val,
        url: publicUrl + urls,
        headers: header_val,
        async: async_val,
        data: params,
        traditional: true,
        dataType: 'json',
        success: function (data) {
            if (data.code == 1017 || data.code == 1101) {
                laybindevent(data.msg, 2000, function () {
                    removeData("Authorization");
                    removeData("cacheflag");
                    window.location.href = loginUrl;
                });
            } else {
                if (data.code == 2000) {
                    var authorization = data.refreshToken;
                    if (authorization != null && authorization != '' && authorization != 'null') {
                        updateData("Authorization", authorization);
                    }
                }
                callback(data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (error) {
                error(XMLHttpRequest, textStatus, errorThrown);
            }
            layerror('内部错误，请联系管理员！');
        }
    });
}
// 深度合并
function deepMerge(obj1, obj2) {
    let key;
    for (key in obj2) {
        // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
        // 如果obj2[key]没有值或者值不是对象，此时直接替换obj1[key]
        obj1[key] =
            obj1[key] &&
            obj1[key].toString() === "[object Object]" &&
            (obj2[key] && obj2[key].toString() === "[object Object]")
                ? deepMerge(obj1[key], obj2[key])
                : (obj1[key] = obj2[key]);
    }
    return obj1;
}

// 格式化数字
function fmoney(s,n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
}