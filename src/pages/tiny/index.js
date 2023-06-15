/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { Component, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCodeStyling from 'qr-code-styling';
import { QRCodeFavBase64 } from './images.js';
import './normalize.scss';
import './tiny.scss';
import { addStyle, genCustomConsole, getQueryParam, loadScript, mTrim, updateQueryParam, genHashCode, deepCopyObject, isValidUrl } from 'mazey';

// Test Examples:
// http://localhost:9202/tiny.html
// https://blog.mazey.net/tiny
//  https://blog.mazey.net/tiny
// blog.mazey.net/tiny
// ftp://main/sub?id=2333
// sheeee://hahah/sub?id=num
// 短消息
// AAa
// b
// <a href="https://blog.mazey.net/tiny" target="_blank">xxx</a><br/>
// http://blog.mazey.net/tiny/index.html?msg=<a href="https://blog.mazey.net/tiny" target="_blank">xxx</a><br/>
const TinyCon = genCustomConsole('TinyCon:', { showDate: true });
const domain = 'https://mazey.cn';
const newDomain = 'https://i.mazey.net';
const backupDomain = 'https://s.feperf.com';
const libBaseUrl = '//i.mazey.net/lib';
// It's ok yet. 'https://i.mazey.net/icon/fav/logo-dark-circle.svg';
const QRCodeFav = QRCodeFavBase64;
const defaultTinyTitle = '备用链接';
const Tiny = () => {
  const [ori_link, setOriLink] = useState('');
  const [tiny_link, setTinyLink] = useState('');
  // const [msgLink, setMsgLink] = useState('');
  const [queryMsg, setQueryMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  // const [backupTinyLink, setBackupTinyLink] = useState('');
  const [loadedLayer, setLoadedLayer] = useState(false);
  // Case: { title: 'Tiny', link: 'https://blog.mazey.net/tiny', area: 'global' }
  const [backupTinyLinks, setBackupTinyLinks] = useState([]);
  const ref = useRef(null);
  // Variates
  let msgLink = '';

  useEffect(() => {
    TinyCon.log('tiny');
    localStorage.setItem('mazey_loaded_tiny', '1');
    // Load
    (async () => {
      if (!(window.$ || window.jQuery)) {
        await loadScript(`${libBaseUrl}/jquery/2.1.1/jquery.min.js`);
      }
      await loadScript(`${libBaseUrl}/layer/layer.js`)
        .then(() => {
          setLoadedLayer(true);
        });
      const tempQueryMsg = getQueryParam('msg');
      if (tempQueryMsg) {
        // setOriLink(tempQueryMsg);
        setTinyLink(tempQueryMsg);
        setQueryMsg(tempQueryMsg);
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
      TinyCon.log('tryAgain', tryAgain);
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
        TinyCon.log('Tiny Link', res.data.tiny_link);
        return res.data.tiny_link;
      });
  };

  const getNewTinyLink = (oriLink) => {
    return axios.post(`${newDomain}/server/generate/short-link`, {
      ori_link: oriLink,
    }).then(res => {
      let { data: { data: { tiny_link } } } = res;
      if (typeof tiny_link === 'string' && tiny_link.length > 0 && tiny_link.includes('mazey.cn')) {
        tiny_link = tiny_link.replace('mazey.cn', 'i.mazey.net');
      }
      TinyCon.log('getNewTinyLink', tiny_link);
      return tiny_link;
    });
  };

  const hashCodeToLink = hashCode => {
    if (typeof hashCode === 'string' && hashCode.length <= 4 && isValidENCode(hashCode)) {
      const link = `${domain}/t/${hashCode.toLowerCase()}`;
      TinyCon.log('link', link);
      loadedLayer && window.layer.confirm(`检测到输入短字符，将跳转至：${link}`, {
        title: '提示',
        btn: ['确认', '取消']
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
    if (!isValidAnyUrl(link)) {
      TinyCon.log('convertToMsg link', link);
      // TinyCon.log('ori_link', link);
      let linkForMsg = link;
      let isTag = false;
      if (isHtmlTag(linkForMsg)) {
        linkForMsg = linkForMsg.replace(/<[^>]+>/g, '');
        isTag = true;
      }
      loadedLayer && window.layer.confirm(`检测到输入${isTag ? '标签' : '文字'}，将通过短链传递：${linkForMsg}`, {
        title: '提示',
        btn: ['确认', '取消']
      }, function () {
        retLink = updateQueryParam(location.href, 'msg', linkForMsg);
        TinyCon.log('retLink', retLink);
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

  const checkMsg = async (link) => {
    let ret = false;
    const tempMsgLinkRet = await convertToMsg(link);
    TinyCon.log('tempMsgLinkRet', tempMsgLinkRet);
    if (tempMsgLinkRet === 'cancel') {
      ret = false;
    } else if (typeof tempMsgLinkRet === 'string' && isValidAnyUrl(tempMsgLinkRet)) {
      // setMsgLink(tempMsgLinkRet);
      msgLink = tempMsgLinkRet;
      ret = true;
    } else if (typeof tempMsgLinkRet === 'string' && tempMsgLinkRet.includes('localhost:9202')) {
      // Debug
      // setMsgLink(tempMsgLinkRet);
      msgLink = tempMsgLinkRet;
      ret = true;
    }
    return ret;
  };

  const fetchShortLink = async () => {
    let real_ori_link = '';
    // if (!(ori_link.includes('http') || isValidAnyUrl(ori_link))) {
    //   // Quickly Visit
    //   if (hashCodeToLink(ori_link)) {
    //     return;
    //   }
    //   real_ori_link = `http://${mTrim(ori_link)}`;
    // } else {
    //   real_ori_link = mTrim(ori_link);
    // }
    TinyCon.log(`ori_link_${ori_link}_`);
    const trimOriLink = mTrim(ori_link);
    const suppleHttp = `http://${trimOriLink}`;
    if (trimOriLink === '') {
      msg('不能为空');
      return;
    } else if (isValidAnyUrl(trimOriLink)) {
      real_ori_link = trimOriLink;
    } else if (hashCodeToLink(trimOriLink)) {
      return;
    } else if (await checkMsg(trimOriLink)) {
      real_ori_link = msgLink;
    } else if (isValidAnyUrl(suppleHttp)) {
      real_ori_link = suppleHttp;
    } else {
      // Quickly Visit
      // if (!hashCodeToLink(trimOriLink)) {}
      msg('请输入正确的链接');
      return;
    }
    setOriLink(real_ori_link);
    // Stop using `ori_link` and start using `real_ori_link`.
    // const msgLink = await convertToMsg(real_ori_link);
    // TinyCon.log('msgLink', msgLink);
    // if (msgLink === 'cancel') {
    //   return;
    // }
    // if (typeof msgLink === 'string' && isValidAnyUrl(msgLink)) {
    //   real_ori_link = msgLink;
    // }
    // // Debug - begin
    // if (typeof msgLink === 'string' && msgLink.includes('localhost:9202')) {
    //   real_ori_link = msgLink;
    // }
    // Debug - end
    // setBackupTinyLink('');
    setBackupTinyLinks([]);
    setShowQRCode(false);
    if (typeof real_ori_link === 'string' && real_ori_link.includes(' ')) {
      TinyCon.log('ori_link before trim:', real_ori_link);
      real_ori_link = mTrim(real_ori_link);
    }
    loadedLayer && window.layer.load(1);
    TinyCon.log('Ultimate', real_ori_link);
    const tinyLink = await axios.post(`${domain}/server/generate/short-link`, {
      ori_link: real_ori_link,
    }).then(res => {
      loadedLayer && window.layer.closeAll('loading');
      const { data: { data: { tiny_link } } } = res;
      setTinyLink(tiny_link);
      setCopied(false);
      msg('成功');
      return tiny_link;
    }).catch(err => {
      loadedLayer && window.layer.closeAll('loading');
      msg('网络错误');
      TinyCon.error(err.message);
    });
    // QRCode
    if (typeof tinyLink === 'string' && tinyLink.includes('http')) {
      setShowQRCode(true);
      setTimeout(() => {
        convertUrlStringToQRCode(tinyLink);
      }, 500);
    }
    // Backup
    const bakLinks = [];
    getTinyLink(real_ori_link).then(backupTinyLink => {
      if (isValidAnyUrl(backupTinyLink)) {
        bakLinks.push({
          title: defaultTinyTitle,
          link: backupTinyLink,
          area: '全球',
          copied: false,
        });
        setBackupTinyLinks(deepCopyObject(bakLinks));
      }
    });
    getNewTinyLink(real_ori_link).then(backupTinyLink => {
      if (isValidAnyUrl(backupTinyLink)) {
        bakLinks.push({
          title: defaultTinyTitle,
          // link: backupTinyLink.replace('mazey.cn', 'i.mazey.net'),
          link: backupTinyLink,
          area: '境内',
          copied: false,
        });
        setBackupTinyLinks(deepCopyObject(bakLinks));
      }
    });
  };

  const inputChange = ({ target: { value: ori_link } }) => {
    setOriLink(ori_link);
  };

  const handleKeyDown = ({ key }) => {
    // https://www.w3.org/TR/uievents-key/#keys-whitespace
    if (key === 'Enter') {
      fetchShortLink();
    }
  };

  const isHtmlTag = str => {
    return /<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)/g.test(str);
  };

  // const isValidHttpWwwUrl = url => {
  //   if (isHtmlTag(url)) {
  //     return false;
  //   }
  //   // eslint-disable-next-line max-len
  //   const regIns = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm;
  //   return regIns.test(url);
  // };

  const isValidAnyUrl = url => {
    // if (isHtmlTag(url)) {
    //   return false;
    // }
    // eslint-disable-next-line max-len
    // const regIns = /[a-zA-Z0-9]+:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\b([-a-zA-Z0-9\u4E00-\u9FA5()!@:%_+.~#?&//=]*)/gm;
    // return regIns.test(url);
    return isValidUrl(url);
  };

  // Detect including Chinese?
  // const hasChinese = str => {
  //   return /[\u4E00-\u9FA5]+/g.test(str);
  // };

  const isValidENCode = str => {
    return /^[a-zA-Z]+$/g.test(str);
  };

  const copyOneOfBackupTinys = (index) => {
    let backupTinyLink = backupTinyLinks[index];
    if (backupTinyLink) {
      backupTinyLink = Object.assign(backupTinyLink, { copied: true });
      setBackupTinyLinks(prevBackupTinyLinks => {
        const newBackupTinyLinks = [...prevBackupTinyLinks];
        newBackupTinyLinks[index] = backupTinyLink;
        return newBackupTinyLinks;
      });
    }
  };

  const convertUrlStringToQRCode = url => {
    TinyCon.log('convertUrlStringToQRCode', url);
    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: url,
      image: QRCodeFav,
      dotsOptions: {
        color: '#111111',
        type: 'square',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 0,
      },
    });
    qrCode.append(ref.current);
  };

  return (
    <div className='tiny-box'>
      <div className='generate'>
        <input value={ori_link}
          onChange={inputChange}
          onKeyDown={handleKeyDown}
          placeholder={queryMsg ? '消息接收成功，复制下面的文字，或者在此输入长链接或短文字' : '请输入长链接'}
          autoFocus={!queryMsg}
        />
        <button type='button' onClick={fetchShortLink}>生成</button>
      </div>
      <div className='result-show'>
        {/* 短链接 */}
        {
          tiny_link && <input value={tiny_link} placeholder='请复制短链接' onChange={() => {}} autoFocus={!!queryMsg} />
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
        backupTinyLinks.map((tiny, index) => (
          <div className='generated-result is-backup' key={`${index}-${genHashCode(tiny.link)}`}>
            <span>{tiny.title} {index + 1}「{tiny.area}」：</span>
            <a href={tiny.link} target='_blank' title='备用链接'>{tiny.link}</a>
            <CopyToClipboard onCopy={() => copyOneOfBackupTinys(index)} text={tiny.link}>
              <button>复制</button>
            </CopyToClipboard>
            {
              tiny.copied ? <span className='copied'>已复制</span> : ''
            }
          </div>
        ))
      }
      {
        showQRCode
          ? <div className='generated-result is-qr'>
            <div className='qr-code' id='qr-code' ref={ref}></div>
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

TinyInit('#tiny-box', { isGrayBackground: true });

window.TINY_INIT = TinyInit;

// ReactDom.render(<Tiny />, document.getElementById('tiny-box'));
