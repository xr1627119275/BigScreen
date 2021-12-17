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
function Modal(opt) {
    var options = {

    }
}