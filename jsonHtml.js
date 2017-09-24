const handlebars = require('handlebars');

/**
 * Class for make html route plan
 */
class RoutePlanPrintForm {
    /**
     * Template for handlebars
     * @return {string}
     */
    static get template() {
        return `<link rel="stylesheet" href="css/bootstrap.min.css">
                    <style>
                        .table-header-wrapper {
                            font-size: 13px;
                            width: 100%;
                            height: 52px;
                            border-top: 2px solid black;
                            border-bottom: 1px solid black;
                        }
                
                        .table-header-wrapper div {
                            float: left;
                            text-align: center;
                        }
                
                        .table-header-wrapper .bordered-div {
                            border-right: 2px solid black;
                            height: 50px;
                        }
                
                        .left-border {
                            border-left: 2px solid black;
                        }
                
                        .table-row-wrapper {
                            font-size: 13px;
                            width: 100%;
                            height: 58px;
                            border-bottom: 1px solid black;
                            border-top: 1px solid black;
                            page-break-inside: avoid;
                        }
                
                        .table-row-wrapper div {
                            float: left;
                            text-align: center;
                            border-right: 2px solid black;
                            height: 57px;
                        }
                        
                        .table-row-wrapper .special-word-break{
                            text-align: left;
                            word-break: break-all;
                            padding-left: 2px;
                            padding-right: 2px;
                        }
                
                        .table-footer-wrapper {
                            font-size: 13px;
                            width: 100%;
                            height: 20px;
                            border-top: 1px solid black;
                            border-bottom: 2px solid black;
                        }
                
                        .table-footer-wrapper div {
                            float: left;
                            text-align: center;
                            border-right: 2px solid black;
                            height: 19px;
                        }
                        div{
                            line-height : 1.2;
                        }
                    </style>
                    <div class="container" style="padding:20px; width:100%">
                    <div class="row">
                        <div class="col-md-12" style="padding-bottom:15px">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <p align="center"><span style='font-size: 100%; font-weight: bold;'>МАРШРУТНЫЙ ЛИСТ #{{number}} (на {{date}})</span>
                            </p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <p align="center"><span style='font-size: 100%; font-weight: bold;'>{{description}}</span>
                            </p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table" style="font-size:14px">
                                <tr>
                                    <td>ТС:</td>
                                    <td>{{carName}}</td>
                
                                    <td style="width:100px">ВОДИТЕЛЬ:</td>
                                    <td style="width:200px">{{fio}}</td>
                                </tr>
                                <tr>
                                    <td>Тип Груза:</td>
                                    <td colspan="3">{{typeWeight}}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="row-center">
                        <div class="col-md-12">
                            <p align="center"><b>МАРШРУТ СЛЕДОВАНИЯ</b></p>
                        </div>
                    </div>
                    <div class="row-center">
                        <div class="table-header-wrapper">

                            <div class="bordered-div left-border" style="width:3%">#</div>
                            <div class="bordered-div" style="width:15%">Геозона (адрес)</div>
                            <div class="bordered-div" style="width:18%">Наименование юридического лица</div>
                            <div class="bordered-div" style="width:8%">Время</div> 
                            <div class="bordered-div" style="width:4%"> 
                                <div style="width:100%; border-bottom: 2px solid black; height:25px">План</div>
                            </div>
                            <div class="bordered-div" style="width:4%">
                                <div style="width:100%; border-bottom: 2px solid black; height:25px">Факт</div>
                            </div>

                            <div class="bordered-div" style="width:13%">Телефон</div>
                            <div class="bordered-div" style="width:14%">Комментарий</div>
                            <div class="bordered-div" style="width:14%">Ф.И.О. ответственного</div>
                            <div class="bordered-div" style="width:7%">Подпись</div>

                        </div>

                        {{#each table}}
                         <div style="clear:both; page-break-after: auto;"></div>
                         <div class="table-row-wrapper">
                            <div class="left-border" style="width:3%">{{this.number}}</div>
                            <div class="special-word-break" style="width:15%">{{this.geoName}}</div>
                            <div class="special-word-break" style="width:18%">{{this.caName}}</div>
                            <div class="special-word-break" style="width:8%">{{this.time}}</div>
                            <div style="width:4%">{{this.plan}}</div>
                            <div style="width:4%">{{this.fact}}</div>

                            <div style="width:13%">
                                <nobr>{{this.telephone}}</nobr>
                            </div>
                            <div style="width:14%">{{this.comment}}</div>
                            <div style="width:14%"></div>
                            <div style="width:7%"></div>
                          </div>
                        {{/each}}

                        <div style="clear:both; page-break-after: auto;"></div>
                        <div class="table-footer-wrapper">

                            <div class="left-border" style="width:44%">Итого:</div>

                            <div style="width:4%">{{summary.plan}}</div>
                            <div style="width:4%"></div>
                            <div style="width:48%"></div>
                        </div>
                    </div>
                </div>`;
    }

    /**
     * Функция заполняет шаблон данными и возвращает итоговый html
     * @param data {object} Объект с данными для построения печатной формы План задания
     * @returns {*}
     */
    static jsonToHTML(data) {
        const html = this._createHTML(this.template, data);
        return html;
    }

    static _createHTML(template, data) {
        const preparedData = this._prepareData(data);
        const compiled = handlebars.compile(template);
        return compiled(data);
    }

    static _prepareData(data) {
        const table = [];
        const tbl = data.table;

        for (const i in tbl) {
            const number = tbl[i].number;
            const geoName = tbl[i].geoName;
            const caName = tbl[i].caName;
            const time = tbl[i].time;
            const stopTime = tbl[i].stopTime;
            let plan = tbl[i].plan;
            let planm = tbl[i].planm;
            if (parseInt(plan) === 0 && parseInt(planm) === 0) {
                plan = 'По факту';
                planm = '';
            }
            const fact = '&nbsp&nbsp&nbsp';
            const factm = '&nbsp&nbsp&nbsp';
            const telephone = delSlash(tbl[i].telephone);
            const comment = tbl[i].comment;
            table.push({
                number,
                geoName,
                caName,
                time,
                stopTime,
                plan,
                planm,
                fact,
                factm,
                telephone,
                comment,
            });
        }

        function compareNumber(p1, p2) {
            return p1.number - p2.number;
        }

        table.sort(compareNumber);

        return {
            fio: data.fio,
            typeWeight: data.typeWeight,
            number: data.numberPZ,
            description: data.description,
            date: data.date,
            carName: data.carName,
            table: table,
            summary: data.summary,
        };

        function delSlash(str) {
            return str.replace(/\\/g, '');
        }
    }
}

module.exports = RoutePlanPrintForm;

