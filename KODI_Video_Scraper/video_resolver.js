var cheerio = require('cheerio');
let _eval = require('eval');
let request = require('request');
let got = require('got');
let axios = require('axios');

function unPack(code) {
    function indent(code) {
        try {
            let tabs = 0, old = -1, add = '';
            for (let i = 0; i < code.length; i++) {
                if (code[i].indexOf("{") != -1) tabs++;
                if (code[i].indexOf("}") != -1) tabs--;

                if (old != tabs) {
                    old = tabs;
                    add = "";
                    while (old > 0) {
                        add += "\t";
                        old--;
                    }
                    old = tabs;
                }

                code[i] = add + code[i];
            }
        } finally {
            tabs = null;
            old = null;
            add = null;
        }
        return code;
    }

    let env = {
        eval: function (c) {
            code = c;
        },
        window: {},
        document: {}
    };

    eval("with(env) {" + code + "}");

    code = (code + "").replace(/;/g, ";\n").replace(/{/g, "\n{\n").replace(/}/g, "\n}\n").replace(/\n;\n/g, ";\n").replace(/\n\n/g, "\n");

    code = code.split("\n");
    code = indent(code);

    code = code.join("\n");
    return code;
}

class Video_resolver {
    async ResolveMixdrop(html_page) {
        try {
            let video_url = '';
            let $ = cheerio.load(html_page);
            let script_list = $('script').get();
            for (let i = 0; i < script_list.length; i++) {
                let script = script_list[i].children[0];
                if (script && script.data.includes('MDCore.ref')) {
                    let script_code = script.data;
                    let eval_index = script_code.indexOf('eval(function(p,a,c,k,e,d)');
                    if (eval_index === -1)
                        return '';
                    let eval_code = script_code.substring(eval_index).trim();
                    let unpack_code = unPack(eval_code);
                    let wurl = unpack_code.split(';')[2].split('"')[1];
                    if (!wurl.includes('http'))
                        video_url = 'https:' + wurl;
                    else
                        video_url = wurl;
                }
            }
            return video_url;
        } catch {
            return '';
        }

    }

    async ResolveUptostream(html_page) {
        try {
            let video_url = '';
            let decrypt_code = html_page + 'exports.decrypt_data = sources;';
            video_url = _eval(decrypt_code).decrypt_data[0].src;
            return video_url;
        } catch {
            return '';
        }
    }

    async ResolveStreamzCC(html_page) {
        try {
            let video_url = '';
            let $ = cheerio.load(html_page);
            let script_list = $('script').get();
            for (let i = 0; i < script_list.length; i++) {
                let script = script_list[i].children[0];
                if (!script) continue;
                let script_code = script.data;
                let eval_index = script_code.indexOf('eval(function(p,a,c,k,e,d)');
                if (eval_index === -1) continue;
                let eval_code = script_code.substring(eval_index).trim();
                let unpack_code = unPack(eval_code);
                let url_start_index = unpack_code.indexOf('https://streamz.vg/');
                let url_end_index = unpack_code.indexOf('.dll');
                video_url = unpack_code.substring(url_start_index, url_end_index + 4);
                if (video_url.includes('https://streamz')) {
                    try {
                        await axios.get(video_url, {maxRedirects: 0});
                    } catch (e) {
                        video_url = e.response.headers.location;
                    }
                    return video_url;
                }
            }
            return video_url;
        } catch {
            return '';
        }

    }
}

module.exports = new Video_resolver();
