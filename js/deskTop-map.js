var bigScreenMap = (function ($, w) {

    var carUpdateEvent = null; //车辆定时更新事件
    var carUpdateTime = 60 * 100; // 车辆定时更新时间 毫秒
    var defaultOptions = {
        carUpdate: true,
        map: null,
        types: [0, 10, 20, 30],
        showEnclosure: false,
        markerClick: function (obj, marker) {

        }
    }
    var markerList = [];
    var markerListsCar = [];
    var markerListCar = [];
    var map;
    var enclosureEnd; // 围栏标点
    var cluster; //聚合对象
    var options;

    var trackObj = null; // 追踪对象
    var trackEvent = null;//  追踪事件
    var trackStartMark = null, trackPoints = [], trackLine = null;

    function refresh(){
     setInterval(getAndRefreshByInterval,60000);
    }


    //获取值
      function getAndRefreshByInterval(){
        var gps = queryGpsAll();
        if(typeof(gps) !== 'undefined' && gps.length >0 ){
            //取消显示之前的位置
         /* if( typeof(markerListsCar) !== 'undefined' && markerListsCar.length>0 ){
                cluster.removeMarkers(markerListsCar);
                markerListsCar = [];
            }*/
            for(var i=0;i<gps.length;i++){
                var g = gps[i];
                //如果是车辆，更新位置
                if(g.type === 20){
                  for (var j = 0; j < markerList.length; j++) {
                    var markerObj = markerList[j];
                    if (markerObj.obj.id === g.id && markerObj.marker !== null) {
                      /*var marker = addMarker(g);
                      markerListsCar.push(marker);*/
                      var positions = g.gps.split(",");
                      var position = new AMap.LngLat(positions[0],positions[1]);
                      markerObj.marker.setPosition(position);
                      break;
                    }
                  }
                }
            }

        }
      }



  // 获取坐标数据
    function queryGpsAll() {
        var gps = [];
        publicAjax(null, "sys/deskTop/queryGpsAll", {}, false, null, function (res) {
            if (res.code == 2000) {
                gps = res.data;
            }
        });
        return gps;
    }

    /**
     * 初始化配置
     */
    function initConfig(callBack) {
        // 创建围栏点样式
        enclosureEnd = new AMap.Icon({
            size: new AMap.Size(25, 34),
            image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
            imageSize: new AMap.Size(135, 40),
            imageOffset: new AMap.Pixel(-95, -3)
        });

        // 加载聚合对象
        addCluster(callBack);
    }

    /**
     * 加载gps到地图里
     * @param options 配置
     */
    function loadGps(op) {
        var markerLists = [];
        map = op.map;
        options = jQuery.extend({}, defaultOptions, op);
        initConfig(function () {
            var gpsList = queryGpsAll();
            var first = true;
            for (var i = 0; i < gpsList.length; i++) {
                var obj = gpsList[i];
                if (jQuery.inArray(obj.type, options.types) !== -1 && obj.gps != null) {
                    var marker = addMarker(obj);

                    if(obj.type === 20){
                        markerListsCar.push(marker);
                        markerListCar.push({obj: obj, marker: marker});
                    }
                    markerList.push({obj: obj, marker: marker});
                    markerLists.push(marker);
                    var positions = obj.gps.split(',');
                    if (first && positions[0] > 1) {
                        first = false;
                        map.setFitView(marker);
                        map.setZoom(12);
                    }
                } else {
                    markerList.push({obj: obj, marker: null});
                }

                if(typeof(obj.markerPoints) !== "undefined" && obj.markerPoints!==null &&obj.markerPoints.length>0){

                    for(var k=0;k<obj.markerPoints.length;k++) {
                        var mark = obj.markerPoints[k];
                        var markerPoint = new AMap.Marker({
                            //map: map,
                            position: mark.gps.split(','),
                            icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                            offset: new AMap.Pixel(-13, -30),
                            clickable: true,

                        });
                        markerPoint.setLabel({
                            position: mark.gps.split(','),  //设置文本标注偏移量
                            offset: new AMap.Pixel(-13, -30),
                            content: "<div class='info1'><input type='text' style='height: 40px;width:80px;text-align:center' class='layui-input'  value=" + mark.content + " readonly/> </div>", //设置文本标注内容
                            direction: 'right', //设置文本标注方位

                        });
                        //markerPoint.setMap(map);
                        markerLists.push(markerPoint);
                        cluster.addMarker(markerPoint);
                        console.log(markerPoint);
                    }
                }

            }
            if (options.showEnclosure) {
                showEnclosureByTypes(options.types);
            }


            //map.setFitView(markerLists);
            //map.setZoom(13);
        });

    }

    /**
     * 追踪车辆信息
     * @param obj 车辆对象
     */
    function trackCar(obj) {
        var getPoints = function () {
            var now = new Date(),
                startTime = format_time(new Date(now.getTime() - 10 * 60 * 1000), 'yyyy-MM-dd HH:mm:ss'),
                endTime = format_time(now, 'yyyy-MM-dd HH:mm:ss');

            // var now = new Date(),
            //     endTime = '2020-06-18 23:59:59',
            //     startTime = '2020-06-18 00:00:00';
            publicAjax(null, "sys/deskTop/getGpsPoints", {
                id: obj.id,
                startTime: startTime,
                endTime: endTime
            }, false, null, function (r) {
                if (r.code === 2000) {
                    if (r.data.length === 0) {
                        return;
                    }
                    trackPoints = [];
                    if (trackLine != null) {
                        map.remove(trackLine);
                    }
                    if (trackStartMark != null) {
                        map.remove(trackStartMark);
                    }
                    $(r.data).each(function (i, t) {
                        var xy = t.location.split(',');
                        trackPoints.push([+xy[0], +xy[1]]);
                    });

                    // 创建一个 Icon
                    var startIcon = new AMap.Icon({
                        // 图标尺寸
                        size: new AMap.Size(25, 34),
                        // 图标的取图地址
                        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
                        // 图标所用图片大小
                        imageSize: new AMap.Size(135, 40),
                        // 图标取图偏移量
                        imageOffset: new AMap.Pixel(-9, -3)
                    });

                    // 将 icon 传入 marker
                    trackStartMark = new AMap.Marker({
                        position: new AMap.LngLat(trackPoints[0][0], trackPoints[0][1]),
                        icon: startIcon,
                        offset: new AMap.Pixel(-13, -30)
                    });

                    trackLine = new AMap.Polyline({
                        path: trackPoints,
                        strokeWeight: 8,
                        strokeOpacity: 0.8,
                        strokeColor: '#0091ea',
                        showDir: true
                    });
                    map.add(trackStartMark);
                    map.add(trackLine);
                    map.setFitView();
                } else {
                    alert("请求数据失败");
                }
            });
        }
        getPoints();
        trackEvent = setInterval(getPoints, 60 * 1000);
    }

    /**
     * 取消追踪车辆信息
     * @param obj
     */
    function cancelTrackCar(obj) {
        if (trackEvent != null) {
            clearInterval(trackEvent);
            trackEvent = null;
            // 清空点
            trackPoints = [];
            if (trackLine != null) {
                map.remove(trackLine);
            }
        }
    }





    /**
     * 添加标注
     * @param obj 对象信息
     * @returns {AMap.Marker}
     */
    function addMarker(obj) {
        var sizeA = 58;
        var sizeB = 40;
        var size = 24;
        var iconPath = "./img/dir-via-yk.png";
        if (obj.type == 0) {
            iconPath = "./img/dir-via-yk.png";
            sizeA = 24;
            sizeB = 24;

        } else if (obj.type == 10) {
            iconPath = "./img/dir-via-zcg.png";
            sizeA = 24;
            sizeB = 24;
        } else if (obj.type == 20) {
            iconPath = "./img/dir-via-ygc.png";
            sizeA = 58;
            sizeB = 40;
            // 如果为
            switch (obj.carType) {
                case 2:
                    iconPath = "./images/car_2.png";
                    break;
                case 3:
                    iconPath = "./images/car_3.png";
                    sizeB = 25;
                    break;
                case 4:
                    iconPath = "./images/car_4.png";
                    break;
                case 5:
                    iconPath = "./images/car_5.png";
                    break;
                case 6:
                    iconPath = "./images/car_6.png";
                    break;
                case 7:
                    iconPath = "./images/car_7.png";
                    break;
                case 8:
                    iconPath = "./images/car_8.png";
                    break;
                case 9:
                    iconPath = "./images/car_9.png";
                    sizeB = 25;
                    break;
                case 10:
                    iconPath = "./images/car_10.png";
                    break;
                case 11:
                    iconPath = "./images/car_11.png";
                    break;
                case 12:
                    iconPath = "./images/car_12.png";
                    break;
                case 16:
                    iconPath = "./images/car_16.png";
                    break;
                case 17:
                    iconPath = "./images/car_17.png";
                    break;
                case 18:
                    iconPath = "./images/car_18.png";
                    break;
                case 19:
                    iconPath = "./images/car_19.png";
                    break;
                case 20:
                    iconPath = "./images/car_20.png";
                    break;
                case 21:
                    iconPath = "./images/car_21.png";
                    break;
            }

        } else if (obj.type == 30) {
            sizeA = 24;
            sizeB = 24;
            iconPath = "./img/dir-via-xm.png";
        }
        var endIcon = new AMap.Icon({
            size: new AMap.Size(sizeA, sizeB),
            image: iconPath,
            imageSize: new AMap.Size(sizeA, sizeB),
        });
        marker = new AMap.Marker({
            icon: endIcon,
            position: obj.gps.split(','),
            // offset: new AMap.Pixel(-13, -30)
            offset: new AMap.Pixel(-7, -15),
        });
        if (options.markerClick !== undefined) {
            marker.on('click', function () {
                options.markerClick(obj, marker);
            });
        }
        // 标注右键
        // marker.on('rightclick', function (e) {
        //     //contextMenu.open(map, e.lnglat);
        //     var contextMenu = new AMap.ContextMenu(); // 右键
        //     if (trackObj == null || trackObj.id !== obj.id) {
        //         contextMenu.addItem("追踪", function () {
        //             if (trackObj != null) {
        //                 cancelTrackCar(trackObj);
        //             }
        //             trackCar(obj);
        //             trackObj = obj;
        //         }, 0);
        //     } else if (trackObj.id === obj.id) {
        //         contextMenu.addItem("取消追踪", function () {
        //             //map.zoomOut();
        //             cancelTrackCar(obj);
        //             trackObj = null;
        //         }, 0);
        //     }
        //     contextMenu.open(map, e.lnglat);
        // });


        //marker.setMap(map);
        cluster.addMarker(marker);
        return marker;
    }

    /**
     * 隐藏标注
     * @param type 类型
     */
    function hideMarkerByType(type) {
        var markers = [];
        for (var i = 0; i < markerList.length; i++) {
            if (markerList[i].obj.type === type) {
                if (markerList[i].marker != null) {
                    cluster.removeMarker(markerList[i].marker);
                    markers.push(markerList[i].marker);
                    markerList[i].marker = null;
                }
            }
        }
        //map.remove(markers);
    }

    /**
     * 显示标注
     * @param type 类型
     */
    function showMarkerByType(type) {
        for (var i = 0; i < markerList.length; i++) {
            var data = markerList[i];
            if (data.obj.type == type && data.marker == null) {
                var marker = addMarker(data.obj);
                data.marker = marker;
            }
        }
    }

    /**
     * 显示电子围栏
     * @param types 类型
     */
    function showEnclosureByTypes(types) {
        // 显示电子围栏
        for (var i = 0; i < markerList.length; i++) {
            var data = markerList[i];
            if (jQuery.inArray(data.obj.type, types) !== -1 && data.marker != null && data.polygonList == null) {
                var enclosureObj = addEnclosure(data);
                data.lineList = enclosureObj.lineList;
                data.polygonList = enclosureObj.polygonList;
                data.markerList = enclosureObj.markerList;
            }
        }
    }

    /**
     * 影藏围栏
     * @param types 类型
     */
    function hideEnclosureByTypes(types) {
        // 隐藏电子围栏
        for (var i = 0; i < markerList.length; i++) {
            var data = markerList[i];
            if (jQuery.inArray(data.obj.type, types) !== -1 && data.polygonList != null) {
                for (var j in data.markerList) {
                    map.remove(data.markerList[j]);
                }
                for (var j in data.polygonList) {
                    map.remove(data.polygonList[j]);
                }
                for (var j in data.lineList) {
                    map.remove(data.lineList[j]);
                }
                data.lineList = null;
                data.polygonList = null;
                data.markerList = null;
            }
        }
    }

    /**
     1.获取所有要渲染多边形的坐标数组
     2.根据坐标数组计算矩形及中心点
     3.根据中心点计算坐标数组的角度并排序
     4.建立角度分组，根据0-360度圆形进行分组，并通过参数划分分组区域
     5.根据中心点与获取划分区域内最远坐标，并保存到新的数组。
     6.根据数组渲染多边形
     */
    var gdFN = {
        //获取角度
        calcAngle: function (start, end) {
            // 计算两点间的角度
            var p_start = map.lngLatToContainer(start), p_end = map.lngLatToContainer(end);
            var diff_x = p_end.x - p_start.x, diff_y = p_end.y - p_start.y;
            return 360 * Math.atan2(diff_y, diff_x) / (2 * Math.PI) + 180;
        },
        //获取矩形和中心
        rectangleAdnCore: function (arr) {
            //获取矩形四个角及中心点
            arr.sort(function (x, y) {
                return x[0] - y[0]
            });
            var x0 = arr[0][0];  //横轴最小值
            var x1 = arr[arr.length - 1][0];  //横轴最大值
            arr.sort(function (x, y) {
                return x[1] - y[1]
            });
            var y0 = arr[0][1];  //纵轴最小值
            var y1 = arr[arr.length - 1][1];  //纵轴最大值
            return {
                rectangle: [[x0, y0], [x0, y1], [x1, y1], [x1, y0]],
                core: [x0 + ((x1 - x0) / 2), y0 + ((y1 - y0) / 2)]
            }
        },
        //根据角度进行排序
        polygonArraySort: function (arr, a2) {
            //根据角度进行排序
            var that = this;
            var arr2 = [];
            for (var i = 0; i < arr.length; i++) {
                arr2.push({"jd": that.calcAngle([arr[i][0], arr[i][1]], a2), "zb": [arr[i][0], arr[i][1]]});
            }
            arr2.sort(function (x, y) {
                return x.jd - y.jd;
            });
            for (var i = 0; i < arr2.length; i++) {
                // console.log("角度排序", JSON.stringify(arr2[i]));
            }
            return arr2;
        },
        //根据角度进行排序
        arrayData2: function (n, data, zxzb) {
            var sortArray = [];
            var arr = [];
            for (var i = 0; i < 360; i = i + n) {
                arr.push([i, i + n]);
            }
            // console.log(JSON.stringify(arr));
            for (var i = 0; i < arr.length; i++) {
                // console.log("分组分段arr[i]",JSON.stringify(arr[i]));
                var ai0 = arr[i][0];
                var ai1 = arr[i][1];
                var zczb = [];
                for (var j = 0; j < data.length; j++) {
                    var dj = data[j];
                    var jd = data[j].jd;
                    if (dj && jd > ai0 && jd < ai1) {
                        // console.log("分组数据",JSON.stringify(data[j]));
                        zczb.push(data[j]);
                    }
                }
                // console.log("角度分组长度",zczb.length);
                if (zczb.length > 0) {
                    var arrk = [];
                    for (var k = 0; k < zczb.length; k++) {
                        var a = AMap.GeometryUtil.distance(zxzb, zczb[k].zb);
                        arrk.push({jl: a, zb: zczb[k].zb});
                    }
                    arrk.sort(function (x, y) {
                        return y.jl - x.jl;
                    });
                    // console.log("完成的排序",arrk[0]);
                    sortArray.push(arrk[0].zb);
                }
            }
            return sortArray;
        }

    };

    /**
     * 添加电子围栏
     * @param data 数据
     */
    function addEnclosure(data) {
        var obj = data.obj, marker = data.marker;
        var lineList = [], polygonList = [], markerList = [];
        $(obj.enclosures).each(function (ii, tt) {
            //围栏类型0：多边形；1：圆形
            var enclosureType = tt.type;
            var radioValue;
            if (enclosureType == 0 || isNull(enclosureType)) {
                radioValue = "polygon";
                var overlays = [];
                var array = tt.gps.split('|');
                for (var j in array) {
                    overlays.push(array[j]);
                }
                var values = polySetPolygon(marker, radioValue, overlays);
                polygonList = polygonList.concat(values);
            } else if (enclosureType === 1) {
                radioValue = "circle";
                var values = polySetCircle(tt.gps, radioValue, tt.distance);
                polygonList = polygonList.concat(values);
            }

        });
        return {
            lineList: lineList,
            polygonList: polygonList,
            markerList: markerList
        }
    }

    /**
     * 获取距离
     * @param startMark 开始点
     * @param endMark 结束点
     * @returns {number} 距离
     */
    function getDistance(startMark, endPosition) {
        var p1 = startMark.getPosition();
        var array = endPosition.split(',');
        var p2 = new AMap.LngLat(array[0], array[1], false);
        var textPos = p1.divideBy(2).add(p2.divideBy(2));
        var distance = Math.round(p1.distance(p2));
        return distance;
    }

    /**
     * 计算中心点和设置点之间距离
     */
    function drawLine(startMark, endPosition) {
        var line, text;
        var p1 = startMark.getPosition();
        var array = endPosition.split(',');
        var p2 = new AMap.LngLat(array[0], array[1], false);
        var path = [p1, p2];
        //判断当前距离线是否在键值集合中存在
        line = new AMap.Polyline({
            map: map,
            strokeColor: '#80d8ff',
            isOutline: true,
            outlineColor: 'white',
            path: path
        });
        return line;
    }

    /**
     * 圆形电子围栏设置
     */
    function polySetCircle(centerGps, radioValue, distance) {
        var polygons = [];
        var arr = centerGps.split(',');
        var polygon = new AMap.Circle({
            center: new AMap.LngLat(arr[0], arr[1]),
            radius: distance, //半径
            borderWeight: 3,
            strokeColor: "#f50707",
            strokeWeight: 1,
            strokeOpacity: 1,
            strokeStyle: 'dashed',
            strokeDasharray: [10, 10],
            fillOpacity: 0,
            zIndex: 50,
        });
        map.add(polygon);
        polygons.push(polygon);

        return polygons;
    }

    /**
     * 多边形电子围栏设置
     */
    function polySetPolygon(centerMarker, radioValue, overlays) {
        var polygons = [];
        //当电子围栏点2个以上绘制电子围栏
        if (overlays.length > 2) {
            var position = [];
            for (var i = 0; i < overlays.length; i++) {
                var pois = overlays[i].split(',');
                var lnglat = new AMap.LngLat(pois[0], pois[1]);
             //   position.push([+pois[0], +pois[1]]);
                position.push(lnglat);
            }
            console.log(position);
          //  var rAndC = gdFN.rectangleAdnCore(position);//获取矩形和中心
          //  var arra2p = gdFN.polygonArraySort(position, rAndC.core);        //根据角度进行排序
          //  var arrD2 = gdFN.arrayData2(1, arra2p, rAndC.core);//根据角度排序
            var polygon = new AMap.Polygon({
                path: position,
                strokeColor: "#f50707",
                strokeWeight: 1,
                strokeOpacity: 0.6,
                strokeStyle: 'dashed',
                fillOpacity: 0.35,
                fillColor: '#ffffff',
                zIndex: 50,
            });
            map.add(polygon);
            polygons.push(polygon);

            // 缩放地图到合适的视野级别
            //map.setFitView([polygon]);
        }
        return polygons;
    }

    /**
     * 添加聚合信息
     */
    function addCluster(callBack) {
        var sts = [{
            url: "https://a.amap.com/jsapi_demos/static/images/blue.png",
            size: new AMap.Size(32, 32),
            offset: new AMap.Pixel(-16, -16)
        }, {
            url: "https://a.amap.com/jsapi_demos/static/images/green.png",
            size: new AMap.Size(32, 32),
            offset: new AMap.Pixel(-16, -16)
        }, {
            url: "https://a.amap.com/jsapi_demos/static/images/orange.png",
            size: new AMap.Size(36, 36),
            offset: new AMap.Pixel(-18, -18)
        }, {
            url: "https://a.amap.com/jsapi_demos/static/images/red.png",
            size: new AMap.Size(48, 48),
            offset: new AMap.Pixel(-24, -24)
        }, {
            url: "https://a.amap.com/jsapi_demos/static/images/darkRed.png",
            size: new AMap.Size(48, 48),
            offset: new AMap.Pixel(-24, -24)
        }];
        var markers = [];
        map.plugin(["AMap.MarkerClusterer"], function () {
            cluster = new AMap.MarkerClusterer(map, markers, {
                styles: sts,
                gridSize: 80,
                minClusterSize: 10
            });

            if (callBack) {
                callBack();
            }
        });
    }

    function setCenter(obj) {
        var isQuery = false;
        for (var i in markerList) {
            var data = markerList[i];
            if (data.obj.id === obj.id) {
                // 设置中心点
                map.setZoomAndCenter(13, data.obj.gps.split(','));

                if (data.marker != null) {
                    if (options.markerClick !== undefined) {
                        options.markerClick(obj, marker);
                    }
                }
                isQuery = true;
            }
        }

        if (!isQuery) {
            // 如果找不到 需要 通过接口在请求一次 获取经纬度 然后进行展示;
        }
    }

    /**
     * 添加类型
     * @param type 类型
     */
    function pushType(type) {
        if (jQuery.inArray(type, options.types) === -1) {
            options.types.push(type);
            showMarkerByType(type);
            if (options.showEnclosure) {
                showEnclosureByTypes(options.types);
            }

            // 如果为车的类型 ，则启动定时器事件

        }
    }

    function deleteType(type) {
        if (jQuery.inArray(type, options.types) !== -1) {
            options.types.splice(jQuery.inArray(type, options.types), 1);
            hideMarkerByType(type);
            hideEnclosureByTypes([type]);

            if (type == 20) {
                if (carUpdateEvent) {
                    clearInterval(carUpdateEvent);
                }
            }
        }
    }

    function setShowEnclosure(state) {
        options.showEnclosure = state;
        if (state) {
            showEnclosureByTypes(options.types)
        } else {
            hideEnclosureByTypes(options.types)
        }
    }

    function getTypes() {
        return options.types;
    }

    /**
     * 车辆更新位置
     */
    function carUpdate() {
        publicAjax(null, "sys/deskTop/queryGpsAll", {}, false, null, function (res) {
            if (res.code == 2000) {
                var gpsList = res.data;
                for (var i = 0; i < gpsList.length; i++) {
                    var obj = gpsList[i];

                    for (var j = 0; j < markerList.length; j++) {
                        var markerObj = markerList[j];
                        if (markerObj.obj.id == obj.id) {
                            var values = obj.gps.split(',');
                            markerObj.marker.setPosition([+values[0], +values[1]]);
                            markerObj.obj = obj;
                            break;
                        }
                    }
                }
            }
        });
    }

    return {
        loadGps: loadGps,
        // showMarkerByType: showMarkerByType,
        // hideMarkerByType: hideMarkerByType,
        // showEnclosureByTypes: showEnclosureByTypes,
        // hideEnclosureByTypes: hideEnclosureByTypes,
        pushType: pushType,
        deleteType: deleteType,
        setShowEnclosure: setShowEnclosure,
        getTypes: getTypes,
        setCenter: setCenter,
        refresh:refresh
    }
});