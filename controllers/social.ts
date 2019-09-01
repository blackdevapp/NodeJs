const passport = require('passport');
const request = require('request-promise');
var https = require("https");
var fs = require("fs");
var videoshow = require('videoshow');
const crypto = require('crypto');
const Crypto = require('crypto-js');
const OAuth = require('oauth-1.0a');
const oauthSignature = require('oauth-signature');
import {google} from 'googleapis';

import * as Youtube from 'youtube-video-api';
import TwitterPost from "../models/tt-post";
import LinkedinPost from "../models/ln-post";
import YoutubePost from "../models/youtube-post";
import Agencies from "../models/agencies";
import Test from "../models/test";
import {reject} from 'q';
/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: process.env.GOOGLE_REDIRECT_URL,
};

const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email'
];
const download = require('image-downloader');
export default class SocialCtrl {
    model = Agencies;
    testModel = Test;

    //google
    createConnection() {
        return new google.auth.OAuth2(
            googleConfig.clientId,
            googleConfig.clientSecret,
            googleConfig.redirect
        );
    }

    getConnectionUrl(auth) {
        return auth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: defaultScope
        });
    }

    getGooglePlusApi(auth) {
        return google.plus({version: 'v1', auth});
    }

    urlGoogle() {
        const auth = this.createConnection();
        const url = this.getConnectionUrl(auth);
        return url;
    }


    getSocialMedial = (agency_id) => {
        return new Promise((resulve, reject) => {
            this.model.findOne({agency_id: agency_id}).select(['social_media']).exec((err, row) => {
                if (err) {
                    return reject(err)
                }


                console.log(row.social_media)

                resulve(row.social_media)
            });

        })
    }
    setFacebookAccount = (fb, agency_id) => {
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.facebook": fb}}, (err) => {
                if (err) {
                    return reject(err)
                }
                resulve({isSuccessful: true})
            });

        })
    }
    setTelegramAccount = (agency_id, account) => {
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.telegram": account}}, (err) => {
                if (err) {
                    reject(err)
                }
                resulve({isSuccessful: true})
            });

        })
    }
    updateFacebookPages = (pages, agency_id) => {
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.facebook": {pages}}}, (err) => {
                if (err) {
                    return reject(err)
                }
                resulve({isSuccessful: true})
            });

        })
    }
    logoutFacebookAccount = (agency_id) => {
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.facebook": {pages: []}}}, (err) => {
                if (err) {
                    return reject(err)
                }
                resulve({isSuccessful: true})
            });

        })
    }
    logoutTwitterAccount = (agency_id) => {
        console.log('revoke ' + agency_id)
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({
                    agency_id: agency_id
                },
                {
                    $set: {
                        "social_media.twitter": {
                            screen_name: '',
                            secret: '',
                            token: ''
                        }
                    }
                }, (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resulve({isSuccessful: true})
                });

        })
    }
    logoutTelegramAccount = (agency_id) => {


        console.log('call logout for ' + agency_id)
        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.telegram": ''}}, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resulve({isSuccessful: true})
                }

            });

        })
    }
    setFacebookAccess = (fb, agency_id) => {

        return new Promise((resulve, reject) => {
            this.model.findOneAndUpdate({agency_id: agency_id}, {$set: {"social_media.facebook": fb}}, (err) => {
                if (err) {
                    return reject(err)
                }

                resulve({isSuccessful: true})
                // res.status(200).json({isSuccessful: true})
                // });
            });


        })


    }

    getFacebookPages = (req, res, next) => {
        const Pages = {
            method: 'GET',
            uri: `https://graph.facebook.com/v3.2/me/accounts?fields=access_token,id,name&access_token=${req.headers['facebooktoken']}`,
            json: true
        };
        request(Pages).then(response => {
            return res.status(200).json({pages: response.data})
        }).catch(err => {
            return res.status(500).json({isSuccessful: false, message: 'Duplicate key error'});
            //
        })
    }

    setTwitterAccess = (req, res, next) => {
        console.log(req.query);
        const agencyId = req.query.agency_id;
        const options = {
            method: 'POST',
            uri: `https://api.twitter.com/oauth/access_token`,
            qs: {
                redirect_uri: `${process.env.URL}/public/social/twitter`,
                oauth_verifier: req.query.oauth_verifier,
                oauth_token: req.query.oauth_token,
            },
            json: true
        };
        request(options).then(response => {
            try {
                console.log(response)
                let data: any = {};
                response.split('&').forEach((v, k) => {
                    var tmpValue = v.split('=');
                    console.log(tmpValue[0])
                    data[tmpValue[0]] = tmpValue[1]

                })
                this.model.findOneAndUpdate({agency_id: agencyId}, {
                    $set: {
                        "social_media.twitter.token": data.oauth_token,
                        "social_media.twitter.secret": data.oauth_token_secret,
                        "social_media.twitter.screen_name": data.screen_name
                    }
                }, (err) => {
                    if (err) {
                        return console.log(err)
                    }
                    res.redirect(`${process.env.URL}/panel/marketing`)

                });

            } catch (e) {
                console.log(e)
            }
        }).catch(err => {
            console.log(err);
        })


    }
    setGoogleAccess = (req, res, next) => {
        console.log(req.query);
        const agencyId = req.query.agency_id;
        const options = {
            method: 'POST',
            uri: `https://api.twitter.com/oauth/access_token`,
            qs: {
                redirect_uri: `${process.env.URL}/public/social/twitter`,
                oauth_verifier: req.query.oauth_verifier,
                oauth_token: req.query.oauth_token,
            },
            json: true
        };
        request(options).then(response => {
            try {
                console.log(response)
                let data: any = {};
                response.split('&').forEach((v, k) => {
                    var tmpValue = v.split('=');
                    console.log(tmpValue[0])
                    data[tmpValue[0]] = tmpValue[1]

                })
                this.model.findOneAndUpdate({agency_id: agencyId}, {
                    $set: {
                        "social_media.twitter.token": data.oauth_token,
                        "social_media.twitter.secret": data.oauth_token_secret,
                        "social_media.twitter.screen_name": data.screen_name
                    }
                }, (err) => {
                    if (err) {
                        return console.log(err)
                    }
                    res.redirect(`${process.env.URL}/panel/marketing`)

                });

            } catch (e) {
                console.log(e)
            }
        }).catch(err => {
            console.log(err);
        })


    }
    setYoutubeAccess = (req, res, next) => {
        console.log(req.query);
        try {
            this.model.findOneAndUpdate({agency_id: req.query.state}, {$set: {"social_media.youtube": req.query.code}}, (err) => {
                if (err) {
                    return console.log(err)
                }
                res.redirect('http://localhost:4200/panel/marketing')
            });
        } catch (e) {
            console.log(e)
        }
    }
    setFlickrAccess = (req, res, next) => {
        console.log(req);

        let httpMethod = 'GET',
            url = 'https://www.flickr.com/services/oauth/request_token',
            parameters = {
                oauth_nonce: Math.floor(Math.random() * 1e9).toString(),
                oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                oauth_consumer_key: 'c7041dd7bd833fbf773e58036f84994a',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_token: req.query.oauth_token,
                oauth_version: '1.0',
                oauth_callback: 'http://localhost:4200/public/social/flickr'
            },
            consumerSecret = '1f6b604eeaae6830',
            tokenSecret = '';

        // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
        let encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret),
            // generates a BASE64 encode HMAC-SHA1 hash
            signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret,
                {encodeSignature: false});

        const options = {
            method: 'GET',
            uri: `https://www.flickr.com/services/oauth/request_token`,
            qs: {
                oauth_nonce: Math.floor(Math.random() * 1e9).toString(),
                oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                oauth_consumer_key: 'c7041dd7bd833fbf773e58036f84994a',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_version: 1.0,
                oauth_signature: encodedSignature,
                oauth_callback: 'http://localhost:4200/public/social/flickr',
                // oauth_signature: '1f6b604eeaae6830',
                // oauth_token: req.query.oauth_token,
                // oauth_verifier: req.query.oauth_verifier,
                // oauth_signature_method:'HMAC-SHA1',
            },
            json: true
        };
        request(options)
            .then(fbRes => {
                console.log(fbRes.access_token)
                console.log(fbRes)
                this.model.findOneAndUpdate({agency_id: req.query.agency_id}, {social_media: {flickr: fbRes.access_token}}, (err) => {
                    if (err) {
                        return console.log(err)
                    }
                    res.status(200).json({isSuccessful: true});
                });
            }).catch(err => {
            console.log(err)
        })

    }


    setPinterestAccess = (req, res, next) => {
        const options = {
            method: 'POST',
            uri: `https://api.pinterest.com/v1/oauth/token`,
            qs: {
                grant_type: 'authorization_code',
                client_secret: '80eb9afbee2e0bde9d1acfb3de884138625343d0ce72d9a9bc9e13cf78df0c5c',
                code: req.query.code,
                client_id: '5011994414539635412'
            },
            json: true
        };
        request(options)
            .then(fbRes => {
                var jsonBody = {
                    "name": "nextJourney",
                    "description": "next journey can access to your pinterest!",
                };
                var postTextOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    uri: `https://api.pinterest.com/v1/boards/?access_token=${fbRes.access_token}`,
                    body: JSON.stringify(jsonBody)
                };
                this.model.findOneAndUpdate({agency_id: 'nj9AsGI11'}, {$set: {"social_media.pinterest": fbRes.access_token}}, (err) => {
                    if (err) {
                        console.log('omad');
                        return console.log(err)
                    }
                    res.status(200).json({isSuccessful: true})

                });
                request(postTextOptions).then(postRes => {
                    console.log('pinterest ', postRes)
                }).catch(e => {
                    console.log('err', e)
                });

            });
    }

    setLinkedinAccess = (req, res, next) => {
        // if (req.query.code) {
        // code...
        const options = {
            method: 'POST',
            uri: `https://www.linkedin.com/uas/oauth2/accessToken?client_secret=${process.env.LINKEDIN_CLIENT_SECRET}`,
            qs: {
                grant_type: 'authorization_code',
                client_secret: `${process.env.LINKEDIN_CLIENT_SECRET}`,
                code: req.query.code,
                client_id: `${process.env.LINKEDIN_CLIENT_ID}`,
                redirect_uri: `${process.env.URL}/api/auth/linkedin/callback?agency_id=${req.query.agency_id}`
            },
            json: true
        };
        request(options)
            .then(lnRes => {
                // console.log(lnRes)
                console.log(req.query);
                // https://api.linkedin.com/v2/me
                const me = {
                    method: 'GET',
                    uri: `https://api.linkedin.com/v2/me`,
                    headers: {
                        "x-li-format": "json",
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + lnRes.access_token
                    },
                    json: true
                };
                request(me)
                    .then(meData => {
                        lnRes['id'] = `urn:li:person:${meData.id}`
                        try {
                            this.model.findOneAndUpdate({agency_id: req.query.agency_id}, {
                                $set: {
                                    "social_media.linkedin": lnRes,
                                }

                            }, (err) => {
                                if (err) {
                                    return console.log(err)
                                }
                                res.redirect(`${process.env.URL}/panel/marketing`)

                            });

                        } catch (e) {
                            console.log(e)
                        }
                    }).catch(e => {
                    console.log('err', e)
                });
            }).catch(e => {
            console.log('err', e)
        });
        // }else if(req.query.access_token){
        // }
    }

    // postInFbPageImage = (req, res, next) => {
    //   var access_token = 'EAAZA3XlOtZAQEBAOnns2mZAerbyls9XeDJOLutZAI8p1qDwqPaPOCZCEuaM5VV6gY1OuSrZAKabQC9iSdMGMSbCY3LZAFdupgzOSJhevKGwz3CzTE1ZA9LgI9HSBpaEyM1olCKbYVomCiTufZB8xmlH9zZBZCpz5Dwn79XFfBURp2xjorocmmqomKK3N6PNcLbX4QqHgxaC2mNYBwZDZD',
    //     pageid = '312665762097450',
    //     fburl = 'https://graph.facebook.com/'
    //       + pageid
    //       + '/photos?access_token='
    //       + access_token,
    //     req,
    //     form;

    //   req = request.post(fburl, function (err, res, body) {
    //     if (err)
    //       return console.error('Upload failed:', err);
    //     console.log('Upload successful! Server responded with:', body);
    //   });
    //   form = req.form()

    //   form.append('message', 'My photo!');
    //   form.append('source', request('https://pixabay.com/get/52e2d0414b53a414f6da8c7dda79367f103bd6e653546c4870297ad4954acc5fbc_1280.jpg'));
    // }
    postInFbPage = (req, res, next) => {
        console.log(req.body.chatId.token);
        const pages = {
            method: 'GET',
            uri: `https://graph.facebook.com/v3.2/me/accounts?fields=access_token,id,name&access_token=${req.body.chatId.token}`,
            json: true
        };
        const options = {
            method: 'GET',
            uri: `https://graph.facebook.com/v3.2/me?fields=id,name&access_token=${req.body.chatId.token}`,
            json: true
        };
        request(pages).then(response => {
            request(options).then(fbRes => {
                let body = req.body;
                const postTextOptions = {
                    method: 'POST',
                    uri: `https://graph.facebook.com/v3.2/312665762097450/feed?access_token=${req.body.chatId.pages[0].access_token}`,
                    body: {
                        message: `${body.data.description}`,
                        link: `https://nextjourney.co/public/${body.agencyId}/landingTour/${body.data.packageId}`
                    },
                    json: true
                };

                let tagsString = '',
                    access_token = `${req.body.chatId.pages[0].access_token}`,
                    pageid = '312665762097450',
                    fburl = 'https://graph.facebook.com/'
                        + pageid
                        + '/photos?access_token='
                        + access_token,
                    gather,
                    form;

                gather = request.post(fburl, function (err, res, body) {
                    if (err)
                        return console.error('Upload failed:', err);
                    console.log('Upload successful! Server responded with:', body);
                });

                body.data.tags.forEach((v, k) => {
                    v = v.replace(new RegExp(' ', 'g'), '_');
                    tagsString = `${tagsString} #${v} `;
                });
                postTextOptions.body.message = `${postTextOptions.body.message}
        ${tagsString}`;

                form = gather.form()

                form.append('message', postTextOptions.body.message);

                form.append('source', request('http://static.asiawebdirect.com/m/phuket/portals/philippines-hotels-ws/homepage/cebu-island/where-to-stay-cebu/pagePropertiesImage/where-to-stay-cebu-island.jpg.jpg'));
            })
        }).catch(err => {
            console.log('err=>>>>>>>>>>', err)
        })
    };


    tagGenerator = (req, res) => {
        const getTags = {
            method: 'GET',
            uri: `https://rapidtags.io/api/index.php?tool=tag-generator&input=${req.query.tag}`
        };
        request(getTags).then(tags => {
            tags = JSON.parse(tags);
            return res.status(200).json({isSuccessful: true, result: tags})
        })
    }

    postInLinkedinPage = (req, res, next) => {
        let tagsString = '';
        req.body.data.tags.forEach((v, k) => {
            v = v.replace(new RegExp(' ', 'g'), '_');
            tagsString = `${tagsString} #${v} `;
        });
        var jsonBody = {
            "content": {
                "contentEntities": [
                    {
                        "entityLocation": `${req.body.data.url}`,
                        "thumbnails": [
                            {
                                "resolvedUrl": `${req.body.data.image}`
                            }
                        ]
                    }
                ],
                "title": `${req.body.data.title}`
            },
            "distribution": {
                "linkedInDistributionTarget": {}
            },
            "owner": `${req.body.owner}`,
            "subject": `${req.body.data.title}`,
            "text": {
                "text": `${req.body.data.description}

              ${tagsString}`
            }
        }
        var postTextOptions = {
            method: 'POST',
            headers: {
                "x-li-format": "json",
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + req.body.chatId
            },
            uri: `https://api.linkedin.com/v2/shares`,
            data: JSON.stringify(jsonBody),
            body: jsonBody,
            json: true
        };
        request(postTextOptions).then(postRes => {
            const obj = new LinkedinPost(req.body.data);
            obj.associated_agency = req.body.agencyId;
            obj.save((err, item) => {
                if (err && err.code === 11000) {
                    res.sendStatus(400);
                }
                if (err) {
                    return console.error(err);
                }
                res.status(200).json({isSuccessful: true, post: item, lnRes: postRes});
            });
            // res.status(200).json({isSuccessful: true, data: postRes})
        }).catch(e => {
            console.log(e)
            res.status(500).json({error: e.toString()})
        });
    };
    postInPinterest = (req, res, next) => {

        var postTextOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            uri: `https://api.pinterest.com/v1/me/?access_token=${req.body.chatId}`,
        };
        request(postTextOptions).then(userDetail => {
            var jsonBody1 = {
                "board": `${userDetail.username}/nextJourney`,
                "note": "next journey can access to your pinterest!",
                "image_url": "http://digifarsi.com/wp-content/uploads/2016/03/POTD_chick_3597497k.jpg"
            };
            var postTextOptions1 = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.body.chatId
                },
                uri: `https://api.pinterest.com/v1/pins/?access_token=${req.body.chatId}`,
                body: JSON.stringify(jsonBody1)
            };
            request(postTextOptions1).then(response => {
                console.log('pins        ', response)
            })
            console.log('pinterest ', userDetail)
        }).catch(e => {
            console.log('err', e)
        });

    };
    postInTwitter = (req, res, next) => {
        var parameters1 = {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            token: req.body.oauth_token,
            token_secret: req.body.oauth_token_secret,
        };
        // let tagsString = '';
        // req.body.data.tags.forEach((v, k) => {
        //   v = v.replace(new RegExp(' ', 'g'), '_');
        //   tagsString = `${tagsString}#${v} `;
        // });
        // let text = `${req.body.data.description}${tagsString}`
        let text = `${req.body.description}]`
        var postOption = {
            method: 'POST',
            oauth: parameters1,
            headers: {
                'Authorization': 'OAuth ' + parameters1,
            },
            qs: parameters1,
            uri: `https://api.twitter.com/1.1/statuses/update.json?status=${text}&media_ids=${req.body.media}`,
        };
        request(postOption).then(tRes => {
            const obj = new TwitterPost(req.body.data);
            obj.associated_agency = req.body.agencyId
            obj.save((err, item) => {
                if (err && err.code === 11000) {
                    res.sendStatus(400);
                }
                if (err) {
                    return console.error(err);
                }
                res.status(200).json({isSuccessful: true, post: item, ttRes: tRes});
            });
        }).catch(err => {
            res.sendStatus(400);
        })

    }
    uploadMediaTwitter = (req, res, next) => {
        // https://upload.twitter.com/1.1/media/upload.json
        var parameters1 = {
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            token: req.body.oauth_token,
            token_secret: req.body.oauth_token_secret,
        };

        var postOption = {
            method: 'POST',
            oauth: parameters1,
            formData: {
                name: 'media',
                media: req.files.media.data
            },
            media: req.files.media,
            headers: {
                'Authorization': 'OAuth ' + Object.keys(parameters1).map(key => key + '=' + parameters1[key]).join('&'),
                // 'Content-Type': 'multipart/form-data',
            },
            uri: `https://upload.twitter.com/1.1/media/upload.json`,
        };
        request(postOption).then(tRes => {
            // res.status(200).json({ isSuccessful: true, data: JSON.parse(tRes) });
            req.body['media'] = JSON.parse(tRes).media_id_string
            next();
        }).catch(err => {
            console.log(err)
            res.sendStatus(400);
        })
    }


    postInYoutubePage = (req, res, next) => {
        var images = [];
        let counter = 0;
        if (req.body.images.length > 0) {
            req.body.images.forEach((item, k) => {
                let options = {
                    url: item,
                    dest: '../tmp'
                }
                download.image(options)
                    .then(({filename, image}) => {
                        console.log('File saved to', filename)
                        images.push({path: filename, loop: 4, caption: req.body.data.name})
                        counter++
                        if (counter === req.body.data.images.length) {
                            let tmp = images[0];
                            images = []
                            images.push(tmp);

                            goVideo();
                        }

                    })
                    .catch((err) => {
                        console.error(err)
                    })

            })
        }

        let goVideo = () => {
            var videoOptions = {
                fps: 25,
                transition: true,
                transitionDuration: 2,
                videoBitrate: 1024,
                videoCodec: 'libx264',
                captionDelay: 4000,
                useSubRipSubtitles: false,
                subtitleStyle: null,
                size: '640x?',
                audioBitrate: '128k',
                audioChannels: 2,
                format: 'mp4',
                pixelFormat: 'yuv420p'
            }
            videoshow(images, videoOptions)
                .save('../tmp/' + req.body.data.name + '.mp4')
                .on('start', function (command) {
                    console.log('ffmpeg process started:', command)
                })
                .on('progress', function (progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('error', function (err, stdout, stderr) {
                    console.error('Error:', err)
                    console.error('ffmpeg stderr:', stderr)
                })
                .on('end', function (output) {
                    console.log('Start Uploading in youtube')
                    let path = '../tmp/' + req.body.data.name + '.mp4';
                    handleUpload(path)

                })
            let handleUpload = (path) => {
                this.model.findOne({agency_id: req.body.agency_id}, (err, agency) => {
                    if (err) {
                        return console.error(err);
                    }
                    var youtube = Youtube({
                        video: {
                            part: 'status,snippet'
                        },
                        tokens: {
                            "access_token": agency.social_media.youtube.access_token,
                            "refresh_token": agency.social_media.youtube.refresh_token
                        },
                        clientId: '4690962132-s9bvdoaeefmn61fe3da2i6ghs2pnget0.apps.googleusercontent.com',
                        clientSecret: 'gHJ1OCdw2Mw8Nlb8Qg90DVv4',
                        saveTokens: false,
                        scope: 'https://www.googleapis.com/auth/youtube.upload'


                    })

                    var params = {
                        resource: {
                            snippet: {
                                title: 'test video',
                                description: 'This is a test video uploaded via the YouTube API'
                            },
                            status: {
                                privacyStatus: 'private'
                            }
                        }
                    }
                    youtube.authenticate(function (err, tokens) {
                        if (err) return console.error('Cannot auth:', err)

                        console.log('Auth tokens:', tokens)
                        upload();
                    })

                    function upload() {
                        youtube.upload(path, params, function (err, video) {
                            // 'path/to/video.mp4' can be replaced with readable stream.
                            // When passing stream adding mediaType to params is advised.
                            if (err) {
                                return console.error('Cannot upload video:', err)
                            }
                            console.log('Video was uploaded with ID:', video.id);

                            const obj = new YoutubePost(req.body.data);
                            obj.associated_agency = req.body.agency_id;
                            obj.youtubeRes = JSON.stringify(video);
                            obj.save((err, item) => {
                                if (err && err.code === 11000) {
                                    res.sendStatus(400);
                                }
                                if (err) {
                                    return console.error(err);
                                }
                                res.status(200).json({isSuccessful: true, post: item, ytRes: video})
                            });

                            // // this is just a test! delete it
                            // youtube.delete(video.id, function (err) {
                            //   if (!err) console.log('Video was deleted')
                            // })
                        })
                    }

                    // youtube.authenticate('4690962132-s9bvdoaeefmn61fe3da2i6ghs2pnget0.apps.googleusercontent.com', 'gHJ1OCdw2Mw8Nlb8Qg90DVv4', function (err, tokens) {
                    // //   if (err) return console.error('Cannot authenticate:', err)

                    //   youtube.upload(path, params, function (err, video) {
                    //     // 'path/to/video.mp4' can be replaced with readable stream.
                    //     // When passing stream adding mediaType to params is advised.
                    //     if (err) {
                    //       return console.error('Cannot upload video:', err)
                    //     }

                    //     console.log('Video was uploaded with ID:', video.id)

                    //     // this is just a test! delete it
                    //     youtube.delete(video.id, function (err) {
                    //       if (!err) console.log('Video was deleted')
                    //     })
                    //   })
                    // })
                });

            }
        }

    }
    generalSocialSharing = (req, res, next) => {
        let fb = {
            "chatId": {
                "token": "EAAZA3XlOtZAQEBAJmA5NkUnAwd0ZB8VJLzUd8RfwIyqZA20JTLuFteExvO0OhTZCiCLRky28CSkZA9Fh5l3jCVYD9jMOgdDjR0ZAZA4wPJrjVtosT509iSbMVSqoe1cuCPiGczqtDWcdYDzGYMeUyRaqZBgkVugYtqV8ZClaoZCmfflQbZAYqs7DxZCm6JvfGfBZBQ5jgBq5Wa5TnwvM9WHiRijUYlkeeFCILVUUtYTox2E5JIJz0TAuPZBzgpb",
                "userID": "2339514999395134",
                "pages": [
                    {
                        "id": "312665762097450",
                        "name": "Beats By Dr. Dre",
                        "access_token": "EAAZA3XlOtZAQEBAECeUCQV6OVYFZANgqmZBCsqZCS8CosP3gjOALxhn0gLriTG7Rr8HnEcZAsB1tXDg6n2P8FpKmoraMhEO3tDgpcvNEz4oKvluEYMl62tHIGFRZCZAxnUpuuvu8CNfeYxXZByxLBkVMmu36RTTUuHiObqL68BjZCwHYvVxouZB1gOFrtwQpM6CAmVJLJGK7PqFQQZDZD",
                        "enable": false
                    }
                ]
            },
            "data": {
                "description": "Come social",
                "link": "njtlpybb8",
                "tags": []

            }
        }
        let ln = {
            "chatId": "AQURR_qnqw8gPrC0r29YjEswCiL5EsUP7MSeFSXEg87vquDxEQAjGQ8v5Qi0cde9ZwscOzSMa4vj23jrEuwS-jwF-WCegUOe5Jk28vNJKsin7CTWQR90sTRlqpMxqdb5rY1ArMPqeFX3nfsW1Bx5-WRrR_m5laMzvxIE-gv9msf6qF_2MhEZGeSYkqOXSe0tNDFPa_usV3Blp6PHvcxnao6lVrbikEUv1bZNZ4Eek7Tgm78cEcsLogJ6xN81t_ZQ3Oz9KvkLSgU9Sy-b2HDqZHiOHzneLkMO00-R3FOuXX_A1n243d03no1_6icH-4SGOLAmlqSyWtP7RjZnnuiL82EwB0Vv5g",
            "owner": "urn:li:person:8v3WVIOPet",
            "data": {
                "description": "Come social",
                "title": "Happy hour",
                "tags": [],
                "image": "http://static.asiawebdirect.com/m/phuket/portals/philippines-hotels-ws/homepage/cebu-island/where-to-stay-cebu/pagePropertiesImage/where-to-stay-cebu-island.jpg.jpg",
                "url": ""

            }
        }

    }
}
