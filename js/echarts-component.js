function initPieChart(ele, name,data, opt) {
    var chart = echarts.init(ele);
    var pieChartOption = {
        tooltip: {
            trigger: 'item'
        },
        color: ['#264ACF','#40F3EF', '#FF9125', '#ED2946' ],
        // 图例
        legend: {
            // x: 'right',
            y: 'center',
            right: '15%',
            bottom: '0%',
            orient : 'vertical',
            icon: 'none',
            itemGap: 30,
            formatter(name) {
                var value;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name === name) {
                        value = data[i].value;
                    }
                }
                if (opt && opt._formatter) {
                    return opt._formatter(name, value)
                }
                var arr = [
                    '{icon|}',
                    '{name|' + name + '}{value|' + value + '}',
                ];
                return arr.join('\n')
            },
            textStyle: {
                rich: {
                    icon: {
                        align: 'left',
                        width: 40,
                        height: 8,
                        backgroundColor: 'inherit',
                    },
                    name: {
                        fontSize: 16,
                        align: 'left',
                        color: "#fff",
                        padding: [10, 10,0,0],
                        width: 70,
                    },
                    value: {
                        fontSize: 30,
                        align: 'right',
                        color: "#fff",
                        fontWeight: 400,
                        fontFamily: 'Impact',
                        width: 50
                    },
                    br: {
                        width: 10,
                        height: 1,
                        padding: [10, 0,0,0]
                    }
                }
            },
            // backgroundColor: "#FAFAFA"
        },
        series:
            {
                type: 'pie',
                // radius: ['55%', '80%'],
                radius: '70%',
                center: ['30%', '50%'],
                label: {
                    show: false,
                },
                data: [],
            }
    };

    if (opt && opt.itemGap) {
        pieChartOption.legend.itemGap = opt.itemGap
    }

    pieChartOption.series.data = data
    pieChartOption = deepMerge(pieChartOption, opt)

    chart.setOption(pieChartOption);
    Charts[name] = chart

}

// 折线图
function initBrokenLineChart(ele, name,series, opt) {
    var chart = echarts.init(ele);
    var itemStyle = {
        normal: {
            lineStyle:{
                width:1//设置线条粗细
            }
        }
    }
    var option = {
        color: ['#40F3EF', '#F18A26'],
        title: {
            text: 'm³',
            left: 5,
            textStyle: {
                color: '#FEFFFF',
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: '3%',
            right: '5%',
            icon: 'rect',
            textStyle: {
                color: '#FEFFFF',
                fontSize: 16
            }
        },
        grid:{
            x:10,
            y:40,
            x2:20,
            y2:20,
            containLabel: true,
            borderWidth:1
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisLabel: {
                show: true,
                textStyle: {
                    fontSize: 16,
                    color: '#FEFFFF'
                }
            }
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    height: 1,
                    color: ['#1C4760']
                }
            },
            axisLabel: {
                show: true,
                textStyle: {
                    fontSize: 16,
                    color: '#FEFFFF'
                }
            }
        },
        series: [
            {
                name: '1号搅拌站',
                type: 'line',
                stack: 'Total',
                smooth: true,
                data: [],
                itemStyle,
            },
            {
                name: '2号搅拌站',
                type: 'line',
                stack: 'Total',
                smooth: true,
                data: [],
                itemStyle,
            }
        ]
    };

    option = deepMerge(option, opt)
    series.forEach(item => { 
        // symbol: "none", // 去掉折线小圆点
        item.symbol = "none";
        item.itemStyle = itemStyle
    })
    option.series = series
    chart.setOption(option);

    Charts[name] = chart

}


function initLineChart(ele, name, data1, data2, opt) {
    var chart = echarts.init(ele);
    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        grid: {
            x: 20,
            y: 45,
            x2: 20,
            y2: 20,
            containLabel: true,
            borderWidth: 1
        },

        xAxis:
            {
                type: 'category',
                // boundaryGap: false,
                data: data1,
                axisLabel: {
                    show: true,
                    textStyle: {
                        fontSize: 16,
                        color: '#FEFFFF'
                    }
                }
            }
        ,
        yAxis:
            {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: [splitLineColor]
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        fontSize: 16,
                        color: '#FEFFFF'
                    }
                }
            }
        ,
        series:
            {
                // name: 'Line 1',
                type: 'line',
                // stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,

                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#F18A26'
                        },
                        {
                            offset: 1,
                            color: '#392939'
                        }
                    ])
                },
                data: data2
            }


    };

    option.xAxis.data = data1
    option.series.data = data2
    deepMerge(option, opt)

    chart.setOption(option);
    Charts[name] = chart
}



function initCategoryChart(ele, name, data1, data2, opt) {
    var option = {
        tooltip: {},
        color: ['#FF9125'],
        xAxis: {
            type: 'category',
            data: [],

            textStyle: {
                color: "#fff"
            },
            axisLabel: {
                show: true,
                textStyle: {
                    fontSize: 16,
                    color: '#FEFFFF'
                }
            }
        },
        yAxis: {
            type: 'value',

            splitLine: {
                lineStyle: {
                    color: [splitLineColor]
                }
            },
            axisLabel: {
                show: true,
                textStyle: {
                    fontSize: 16,
                    color: '#FEFFFF'
                }
            }
        },
        grid: {
            x: 50,
            y: 40,
            x2: 20,
            y2: 45,
            borderWidth: 1
        },
        series: [
            {
                data: [],
                type: 'bar',
                barWidth: 30,
                backgroundStyle: {
                    // color: 'rgba(180, 180, 180, 0.2)'
                },
            }
        ]
    }
    var chart = echarts.init(ele);
    option.xAxis.data = data1

    option.series[0].data = data2

    option.series[0].itemStyle = {
        normal: {
            label: {
                show: true,
                position: 'top',
                textStyle: {
                    fontSize: 16,
                    color: '#FEFFFF'
                }
            },
        }
    }
    option = deepMerge(option, opt)

    chart.setOption(option);
    Charts[name] = chart
}