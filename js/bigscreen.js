
$('#screen').css({
    width: global_config.screen.width,
    height: global_config.screen.height,
    overflow:'hidden',
    margin:0,
    position: 'absolute',
    zIndex: 1
});
scale()

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