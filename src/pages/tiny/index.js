/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { Component, useState, useEffect } from 'react';
// import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './normalize.scss';
import './tiny.scss';
import { addStyle, genCustomConsole, getQueryParam, loadScript, updateQueryParam } from 'mazey';

const TinyLog = genCustomConsole('TinyLog:', { showDate: true });
// Example: https://blog.mazey.net/
// const prefixBaseUrl = `${location.protocol}//${location.host}/`;
const domain = 'https://mazey.cn';
const backupDomain = 'https://feperf.com';
const libBaseUrl = '//i.mazey.net/lib';
const Tiny = () => {
  const [ori_link, setOriLink] = useState('');
  const [tiny_link, setTinyLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [backupTinyLink, setBackupTinyLink] = useState('');
  const [loadedLayer, setLoadedLayer] = useState(false);

  useEffect(() => {
    TinyLog.log('tiny');
    // 标记
    localStorage.setItem('mazey_loaded_tiny', '1');
    // Load
    // //i.mazey.net/cdn/jquery/2.1.1/jquery.min.js
    (async () => {
      if (!(window.$ || window.jQuery)) {
        await loadScript(`${libBaseUrl}/jquery/2.1.1/jquery.min.js`);
      }
      await loadScript(`${libBaseUrl}/layer/layer.js`)
        .then(() => {
          setLoadedLayer(true);
          // msg('加载完成');
        });
      const queryMsg = getQueryParam('msg');
      if (queryMsg) {
        setOriLink(queryMsg);
        msg('消息接收成功');
      }
    })();
  }, []);

  const msg = (content, tryAgain = true) => {
    if (loadedLayer) {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (window.layer && typeof window.layer === 'object') {
      window.layer.msg(content, { time: 2 * 1000 });
    } else if (tryAgain === true) {
      TinyLog('tryAgain', tryAgain);
      setTimeout(() => {
        msg(content, false);
      }, 1000);
    }
  };

  const getTinyLink = (oriLink) => {
    return axios.post(`${backupDomain}/api/gee/generate-short-link`, {
      ori_link: oriLink,
    })
      .then(res => {
        TinyLog.log('Tiny Link', res.data.tiny_link);
        return res.data.tiny_link;
      });
  };

  const hashCodeToLink = hashCode => {
    if (typeof hashCode === 'string' && hashCode.length <= 4) {
      const link = `${domain}/t/${hashCode.toLowerCase()}`;
      TinyLog.log('link', link);
      loadedLayer && window.layer.confirm(`检测到输入短字符，将跳转至：${link}`, {
        title: '提示',
        btn: ['确认', '取消'] // 按钮
      }, function () {
        window.open(link);
      }, function () {
        msg('已取消');
      });
      return true;
    }
    return false;
  };

  const convertToMsg = link => {
    let ok, fail, retLink;
    const status = new Promise((resolve, reject) => {
      ok = resolve;
      fail = reject;
    });
    if (!isValidUrl(link)) {
      TinyLog.log('link', link);
      TinyLog.log('ori_link', ori_link);
      loadedLayer && window.layer.confirm(`检测到输入文字，将通过短链传递：${ori_link}`, {
        title: '提示',
        btn: ['确认', '取消'] // 按钮
      }, function () {
        retLink = updateQueryParam(location.href, 'msg', ori_link);
        TinyLog.log('retLink', retLink);
        ok(retLink);
      }, function () {
        msg('已取消');
        ok('cancel');
      });
    } else {
      ok('valid');
    }
    return status;
  };

  const fetchShortLink = async () => {
    let real_ori_link = '';
    if (ori_link === '') {
      msg('不能为空');
      return;
    }
    if (!ori_link.includes('http')) {
      // Quickly Visit
      if (hashCodeToLink(ori_link)) {
        return;
      }
      real_ori_link = `http://${ori_link}`;
    } else {
      real_ori_link = ori_link;
    }
    const msgLink = await convertToMsg(real_ori_link);
    TinyLog.log('msgLink', msgLink);
    if (msgLink === 'cancel') {
      return;
    }
    if (typeof msgLink === 'string' && isValidUrl(msgLink)) {
      real_ori_link = msgLink;
    }
    // Debug - begin
    if (typeof msgLink === 'string' && msgLink.includes('localhost:9202')) {
      real_ori_link = msgLink;
    }
    // Debug - end
    setBackupTinyLink('');
    // TinyLog.log('real_ori_link', real_ori_link)
    loadedLayer && window.layer.load(1);
    axios.post(`${domain}/server/generate/short-link`, {
      ori_link: real_ori_link,
    }).then(res => {
      // TinyLog.log('fetchShortLink', res)
      const { data: { data: { tiny_link } } } = res;
      setTinyLink(tiny_link);
      setCopied(false);
      loadedLayer && window.layer.closeAll('loading');
      msg('成功');
    }).catch(err => {
      loadedLayer && window.layer.closeAll('loading');
      msg('网络错误');
      TinyLog.error(err.message);
    });
    // Backup
    const backupTinyLink = await getTinyLink(real_ori_link);
    TinyLog.log('Backup Tiny Link', backupTinyLink);
    if (backupTinyLink) {
      setBackupTinyLink(backupTinyLink);
    }
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    // TinyLog.log('inputChange', ori_link)   npm i react react-copy-to-clipboard react-dom --save
    setOriLink(ori_link);
  };

  const handleKeyDown = ({ key }) => {
    // https://www.w3.org/TR/uievents-key/#keys-whitespace
    if (key === 'Enter') {
      fetchShortLink();
    }
  };

  const isValidUrl = url => {
    // eslint-disable-next-line max-len
    const regIns = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm;
    return regIns.test(url);
  };

  return (
    <div className='tiny-box'>
      <div className='generate'>
        <input value={ori_link}
          onChange={inputChange}
          onKeyDown={handleKeyDown}
          placeholder='请输入长链接' autoFocus
        />
        <button type='button' onClick={fetchShortLink}>生成</button>
      </div>
      <div className='result-show'>
        {/* 短链接 */}
        {
          tiny_link && <input value={tiny_link} placeholder='请复制短链接' onChange={() => {}} />
        }
        {/* 复制按钮 */}
        {
          tiny_link
            ? <CopyToClipboard onCopy={() => setCopied(true)} text={tiny_link}>
              <button>复制</button>
            </CopyToClipboard>
            : ''
        }
        {/* 提示 */}
        {
          copied ? <span className='copied'>已复制</span> : ''
        }
        {
          !tiny_link ? <span className='placeholder'>生成的短链接~</span> : ''
        }
      </div>
      {
        backupTinyLink
          ? <div className='generated-result'>
            <span>备用链接：</span>
            <a href={backupTinyLink} target='_blank' title='备用链接'>{backupTinyLink}</a>
          </div>
          : ''
      }
    </div>
  );
};

// Example: TinyInit('#tiny-box', { isGrayBackground: true });
const TinyInit = (selector = '', options = {
  isGrayBackground: false,
}) => {
  if (!selector) {
    return;
  }
  const { isGrayBackground } = options;
  const container = document.querySelector(selector);

  if (container) {
    // ReactDom.render(<Tiny />, container);
    const root = createRoot(container);
    root.render(<Tiny />);

    if (isGrayBackground) {
      addStyle(
        `
          #tiny-box {
            background-color: #eee;
            border-radius: 4px;
          }
        `
      );
    }
  }
};

// TinyInit('#tiny-box');
TinyInit('#tiny-box', { isGrayBackground: true });

window.TINY_INIT = TinyInit;

// ReactDom.render(<Tiny />, document.getElementById('tiny-box'));
