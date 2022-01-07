
$('#screen').css({
    width: global_config.screen.width,
    height: global_config.screen.height,
    overflow:'hidden',
    margin:0,
    position: 'absolute',
    zIndex: 2
});
scale()
// _scale()
$(window).on("resize", scale)

function scale(){
    // 获取window的高度
    var clientH = $(window).height();
    // 初始window与body的比值
    var bi = clientH/ $('#screen').height();
    $('#screen').css('transform','scale('+bi+')');
    // body旋转基点设置
    $('#screen').css('transform-origin','left top 0');
    // document.documentElement.clientWidth(获取浏览器窗口文档显示区域的宽度，不包括滚动条。)求得body与可视化区域的差值，除以二可得body居中的marginLeft的值
    var marginLeft = (parseFloat(document.documentElement.clientWidth) - parseFloat($('#screen').css('width'))*bi)/2;
    // 设置body的marginLeft
    $('#screen').css('margin-left',marginLeft+'px');
}

function _scale() {
    //缩放方法
    var marginLeft = (parseFloat(document.documentElement.clientWidth) - parseFloat($('#screen').css('width'))*bi)/2;

    widWidth = window.innerWidth;
        widHeight = window.innerHeight;
        xScale = (widWidth / global_config.screen.width);
        yScale = (widHeight / global_config.screen.height);
        if (xScale < yScale) {
            //宽度缩放比例小于高度缩放比例时，已宽度缩放比例同比缩放
            sca = xScale;
            origin = 'left center 0px';

        } else {
            sca = yScale;
            origin = 'center top 0px';
        }

        var scale = 'scale(' + sca + ')';
        // if(browser.versions.trident){
        //     $("#screen").css('-ms-transform', scale);//缩放比列 ie9
        // }else if(browser.versions.presto){
        //     $("#screen").css('-o-transform', scale);//缩放比列 Opera
        // }else if(browser.versions.webKit){
        //     $("#screen").css('-webkit-transform', scale);//缩放比列 Safari 和 Chrome
        // }else if(browser.versions.gecko){
        //     $("#screen").css('-moz-transform', scale);//缩放比列 Firefox
        // }else{
        //
        // }
        $("#screen").css('transform', scale);//缩放比列
        $("#screen").css('transform-origin', origin);//缩放之后顶点对齐
    $('#screen').css('margin-left',marginLeft+'px');

}