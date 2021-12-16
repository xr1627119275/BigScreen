jQuery.fn.extend({
    layTableScroll:function (){
        $(this).each(function() {
            var _this=$(this);//存储对象
            var ul = _this.find("tbody");
            var li= ul.find("tr");
            var w= li.length * li.height();
            li.clone().prependTo(ul);
            ul.height(2*w);
            var i=1,l;
            _this.hover(function(){i=0},function(){i=1});
            function autoScroll(){
                l = _this.scrollTop();
                if(l>=w){
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