const logger = require('../messages');
const RoutePlanPrintForm = require('./jsonHtml');
const getPrintFormPZ = require('./printPZ');
const Email = require('./Letter/Email');
const validator = require('validator');
const pdf = require('html-pdf');

class RoutePlansToEmail {
    /**
     * Sending email with route plans in pdf format.
     * @param {Object} params - parameters.
     * {
     *  email: 'vetal1950@gmail.com',
     *  ids: [
     *    '00149114-114a-4638-9275-4f3bdd347fb5',
          '0162446c-c920-4d78-84f3-e37fb6368371',
     *  ]
     * }
     * @return promise -
     *      resolve('Email has been sending')
     *      reject('error')
     */
    async main(params) {
        // get all route plans
        const getRoutePlans = params.ids.map(id => this._getPrintFormPZ(id));
        const routePlans = await Promise.all(getRoutePlans);

        // forming names for pdf files and generate html from json
        const HTMLs = routePlans.map(routePlan => ({
            filename: `${routePlan.date}_${routePlan.description}.pdf`,
            routePlanHtml: RoutePlanPrintForm.jsonToHTML(routePlan),
        }));

        // convert html to pdf
        const promisesPDFs = HTMLs.map(row => this._htmlPdf(row.routePlanHtml, row.filename));
        const PDFs = await Promise.all(promisesPDFs);

        // forming array pdf for attachment
        const emailAddresses = params.email;
        const files = [];
        for (let i = 0; i < PDFs.length; i++) {
            const f = {};
            f.filename = PDFs[i].filename;
            f.content = PDFs[i].pdf;
            files.push(f);
        }

        // prepare data for sending email
        const subjects = [];
        const arrFiles = [];
        for (let i = 0; i < emailAddresses.length; i++) {
            subjects.push('План-задания');
            arrFiles.push(files);
        }

        const email = new Email();
        email.addUsers(emailAddresses);
        email.addSubject(subjects);
        email.addFiles(arrFiles);

        return email.send();
    }

    /**
     * Method for convert html to pdf.
     * @param {string} html - html-file.
     * @param {string} filename - file name.
     * @return promise -
     *      resolve({
     *        pdf: ... //buffer file
     *        filename: 'test.pdf'
     *      })
     *      reject(...)
     */
    async _htmlPdf(html, filename) {
        let dirname = __dirname;
        dirname = dirname.replace(/\\/g, '/');

        const base = `file:///${dirname}/css`;
        const options = {
            format: 'A4',
            base: base,
            orientation: 'portrait',
            width: `${210 * 4 / 3}mm`,
            height: `${297 * 4 / 3}mm`,
            border: {
                top: '1cm',
                right: '3mm',
                bottom: '1cm',
                left: '3mm',
            },
            footer: {
                height: '5mm',
                contents: {
                    default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
                },
            },
        };
        const result = await this._createPDF(html, options);

        return {pdf: result, filename};
    }

    /**
     * Method for convert html to pdf.
     * @param {string} html - html-file.
     * @param {string} options - settings for pdf module.
     * @return Promise -
     *      resolve({
     *        pdf: ... //buffer file
     *        filename: 'test.pdf'
     *      })
     *      reject(...)
     */
    _createPDF(html, options) {
        return new Promise((resolve, reject) => {
            pdf.create(html, options).toBuffer((err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    /**
     * Get route plan from print form.
     * @param {string} id - uuid route plan.
     * @return Promise -
     *      resolve({
      "description": "186 Среда 2 рейс",
      "fio": "Миронов Ю.А.",
      "carName": "МАЗ МСВ А 186 ВА 138",
      "typeWeight": "73111001724",
      "numberPZ": "923",
      "date": "13-09-2017",
      "table": [
        {
          "stopTime": 6,
          "comment": "подпись клиента",
          "number": 1,
          "telephone": "89025613163",
          "plan": 3,
          "planCubicMeters": 0,
          "fact": null,
          "factCubicMeters": null,
          "geoName": "пос.Мегет ДУД",
          "caName": "ОАО \"РЖД\"",
          "time": "10:00-14:00"
        },
      ],
      "summary": {
        "plan": 3
      }
    })
     *      reject('error')
     */
    _getPrintFormPZ(id) {
        return new Promise((resolve, reject) => {
            getPrintFormPZ({id: id}, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}

/**
 * Used for compatibility with legacy project.
 * Checks input parameters and executing logic for send email with route plans.
 * @param {Object} params -
 *  {
        email: ['vetal1950@gmail.com'],
        ids: [
            '803df53f-4faf-4d54-904c-bc2990980c90',
        ],
    }.
 * @return callback -
 *      resolve(null, [ 'Email has been sending' ])
 *      reject('error')
 */

function sendRoutePlansToEmail(params, callback) {
    // check email
    if (!params.email) {
        return callback('Incorrect email');
    }
    if (typeof (params.email) === 'string') {
        params.email = [params.email];
    } else {
        if (!Array.isArray(params.email) || params.email.length === 0) {
            return callback('Incorrect email');
        }

        // check correct email
        for (let i = 0; i < params.email.length; i++) {
            if (!validator.isEmail(params.email[i])) {
                return callback('Not valid emails');
            }
        }
    }

    // check ids
    if (!params.ids || !Array.isArray(params.ids) || params.ids.length === 0) {
        return callback('Incorrect ids');
    }
    for (let i = 0; i < params.ids.length; i++) {
        if (!validator.isUUID(params.ids[i])) {
            return callback('Incorrect id');
        }
    }

    // start main logic
    const rp = new RoutePlansToEmail();
    rp.main(params)
        .then(res => callback(null, res))
        .catch((err) => {
            logger.log(err);
            callback('Error');
        });
}

module.exports = sendRoutePlansToEmail;
