    // 图表切换 
    var doc = document;
    var chartNav = doc.getElementsByClassName('j-chartlist-wrap')[0];
    var charts = doc.getElementsByClassName('contain');
    var chartsNum = chartNav.children.length;
    var chartName = doc.getElementById('chart-name');
    var makeChartBtn = doc.getElementsByClassName('make-chart')[0];

    // 公式编辑器 
    var formula = doc.getElementById('chart-formula'); //  计算公式input框
    var calcBtn = doc.getElementsByClassName('j-calc-btn')[0]; //  计算按钮
    var calcRes = doc.getElementsByClassName('j-calc-res')[0]; //  计算结果框
    var initFormula = formula.getAttribute('placeholder'); //  默认的计算公式

    //  值
    var dataRes = doc.getElementsByClassName('j-data-res')[0]; //  计算结果
    var dataAll = doc.getElementsByClassName('j-data-wrap'); //  一共有多少数据
    var dataSign = doc.getElementsByClassName('j-data-sign'); //  数据参数 [a], [b] 等

    var result = 0; //  公式计算结果
    var sign = 'abcdefjhigklmnopqrstuvwxyz';
    var str = '';
    var resName = ''; //  获取要计算的数据的名称：c(美国| 中国) = a+b
    var INDEX = 0;
    var arr = [];
    var calc_formula = ''; //  公式：c=a+b; 要存取到数据库中

    
    //  图表的参数选择是否展示
    var dataCheckBox = doc.getElementsByClassName('j-data-show');
    var table = doc.getElementsByClassName('info-table')[0];

    /*
     ** @[公式计算]
     ** @[calc_formula]   [str]   [计算的公式 > c=a+b]
     ** @[resName]        [str]   [ 获取要计算的数据的名称：c(美国|中国) = a+b]
     */
    function calc() {
        str = dataRes.value; //  从输入框获取要计算的数据的参数：c（c=a+b）
        INDEX = sign.indexOf(str); //  获取要计算值的索引
        resName = dataAll[INDEX].children[0].getAttribute('data-name');
        calc_formula = dataRes.value + '=' + formula.value;
        if (calc_formula.trim() == '=') {
            calc_formula = initFormula;
        }
        result = eval(calc_formula);
        calcRes.innerHTML = result;
    }

    calcBtn.onclick = calc;

    //    图表初始化
    for (var i = 0; i < dataAll.length; i++) {
        dataSign[i].innerText = sign[i];
        arr[sign[i]] = dataAll[i].children[1].innerText * 1; //  将参数与参数值对应，
    }
    var a = arr['a'];
    var b = arr['b'];
    var c = arr['c'];
    var d = arr['d'];
    var e = arr['e'];
    var f = arr['f'];

    //  图表参数选择展示
    table.onclick = function (ev) {
        var ev = ev || ev.window;
        var target = ev.target || ev.srcElement;

        if (target.nodeName.toLowerCase() == 'input') {
            var checkId = target.getAttribute('data-id');
            $.ajax({
                url: '/show_data/',
                data: {
                    select: target.checked,
                    checkId: checkId,
                    chart_type: currentChart
                },
                success: function () {
                    window.location.reload();
                }
            })
        }
    }

    chartName.onblur = function () {
        //  异步上传图表名字
        $.ajax({
            url: '/set_chart/',
            async: true,
            data: {
                'chart_type': currentChart,
                'chart_tit': chartName.value
            },
            success: function (res) {
                res = JSON.parse(res);
            }
        })
    }

    //  确认生成图表
    makeChartBtn.onclick = function () {
        data = {
            'chart_type': currentChart,
            'chart_tit': chartName.value,
            'info_value': result,
            'info_name': resName,
            'opt': 'true',
            'chart_formula': calc_formula,
        };

        $.ajax({
            url: '/index/',
            async: true,
            data: data,
            success: function (res) {
                window.location.reload()
            }
        })
    }

    // 设置当前图表默认类型 
    var currentChart = charts[0].parentNode.getAttribute('data-chart-type');
    var tbody = document.getElementsByTagName('tbody')[0];
    function showCharts() {
        for (var i = 0; i < chartsNum; i++) {
            charts[i].style.display = 'none';
            if (this == chartNav.children[i]) {
                // 标记当前的图表类型
                selectChart = this.dataset.type;
                charts[i].style.display = 'block';
            }
        }
        data={
            'selectChart': selectChart,
            'currentChart':currentChart
        };
        $.ajax({
            url: '/chart_data/',
            data:data,
            success: function(res){
                console.log(res);
                window.location.reload();
            }
        })
    }

    for (var i = 0; i < chartsNum; i++) {
        chartNav.children[i].onclick = showCharts;
    }