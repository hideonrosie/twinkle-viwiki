import { WarnCore, obj_entries, warningLevel, warning, getPref } from './core';

export class Warn extends WarnCore {
    footerlinks = {
        'Chọn cấp độ cảnh báo': 'WP:UWUL#Levels',
        'Tùy chọn cảnh báo': 'WP:TW/PREF#warn',
        'Trợ giúp Twinkle': 'WP:TW/DOC#warn',
        'Phản hồi': 'WT:TW',
    };

    warningLevels: Record<
        string,
        {
            label: string;
            summaryPrefix?: string;
            selected: (pref: number) => boolean;
            visible?: () => boolean;
        }
    > = {
            level1: {
                label: 'Cấp độ 1: Lưu ý chung',
                selected: (pref) => pref === 1,
            },
            level2: {
                label: 'Cấp độ 2: Chú ý',
                selected: (pref) => pref === 2,
            },
            level3: {
                label: 'Cấp độ 3: Cảnh báo',
                selected: (pref) => pref === 3,
            },
            level4: {
                label: 'Cấp độ 4: Cảnh báo cuối cùng',
                selected: (pref) => pref === 4,
            },
            level4im: {
                label: 'Cấp độ 4im: Cảnh báo một lần duy nhất',
                selected: (pref) => pref === 5,
            },
            singlenotice: {
                label: 'Thông báo về một vấn đề',
                selected: (pref) => pref === 6,
                visible: () => !getPref('combinedSingletMenus'),
            },
            singlewarn: {
                label: 'Cảnh báo một vấn đề',
                selected: (pref) => pref === 7,
                visible: () => !getPref('combinedSingletMenus'),
            },
            singlecombined: {
                label: 'Tin nhắn về một vấn đề',
                selected: (pref) => pref === 6 || pref === 7,
                visible: () => !!getPref('combinedSingletMenus'),
            },
            kitchensink: {
                label: 'Tất cả bản mẫu cảnh báo',
                selected: (pref) => pref === 10,
            },
            // Chưa hỗ trợ
            // autolevel: {
            // 	label: 'Tự động chọn cấp độ (1–4)',
            // 	selected: (pref) => pref === 11,
            // },
            custom: {
                label: 'Cảnh báo tùy chỉnh',
                selected: (pref) => pref === 9,
                visible: () => !!getPref('customWarningList')?.length,
            },
        };

    processWarnings() {
        type MessageConfig = {
            label: string;
            summary: string;
            heading?: string;
            suppressArticleInSummary?: true;
        };

        type MessagesType = {
            levels: Record<
                string,
                Record<string, Record<string, MessageConfig>>
            >;
            singlenotice: Record<string, MessageConfig>;
            singlewarn: Record<string, MessageConfig>;
        };

        /*
         * Dữ liệu cảnh báo của viwiki.
         *
         * Cấu trúc:
         *
         * levels
         * ├── nhóm
         * │   ├── uw-template
         * │   │   ├── level1
         * │   │   ├── level2
         * │   │   ├── level3
         * │   │   ├── level4
         * │   │   └── level4im
         *
         * singlenotice
         * └── uw-template
         *
         * singlewarn
         * └── uw-template
         */
        const messages: MessagesType = {
            "levels": {
                "Cảnh báo/Nhắc nhở chung": {
                    "uw-vandalism": {
                        "level1": {
                            "label": "Phá hoại",
                            "summary": "Lưu ý chung: Chỉnh sửa không theo quy định"
                        },
                        "level2": {
                            "label": "Phá hoại",
                            "summary": "Lưu ý: Chỉnh sửa không theo quy định"
                        },
                        "level3": {
                            "label": "Phá hoại",
                            "summary": "Cảnh báo: Phá hoại"
                        },
                        "level4": {
                            "label": "Phá hoại",
                            "summary": "Cảnh báo cuối cùng: Phá hoại"
                        },
                        "level4im": {
                            "label": "Phá hoại",
                            "summary": "Cảnh báo duy nhất: Phá hoại"
                        }
                    },
                    "uw-disruptive": {
                        "level1": {
                            "label": "Sửa đổi gây hại",
                            "summary": "Lưu ý chung: Chỉnh sửa không theo quy định"
                        },
                        "level2": {
                            "label": "Sửa đổi gây hại",
                            "summary": "Lưu ý: Chỉnh sửa không theo quy định"
                        },
                        "level3": {
                            "label": "Sửa đổi gây hại",
                            "summary": "Cảnh báo: Chỉnh sửa không theo quy định"
                        }
                    },
                    "uw-test": {
                        "level1": {
                            "label": "Sửa đổi thử nghiệm",
                            "summary": "Lưu ý chung: Sửa đổi thử nghiệm"
                        },
                        "level2": {
                            "label": "Sửa đổi thử nghiệm",
                            "summary": "Lưu ý: Sửa đổi thử nghiệm"
                        },
                        "level3": {
                            "label": "Sửa đổi thử nghiệm",
                            "summary": "Cảnh báo: Sửa đổi thử nghiệm"
                        }
                    },
                    "uw-delete": {
                        "level1": {
                            "label": "Xóa nội dung, tẩy trống",
                            "summary": "Lưu ý chung: Xóa nội dung, tẩy trống"
                        },
                        "level2": {
                            "label": "Xóa nội dung, tẩy trống",
                            "summary": "Lưu ý: Xóa nội dung, tẩy trống"
                        },
                        "level3": {
                            "label": "Xóa nội dung, tẩy trống",
                            "summary": "Cảnh báo: Xóa nội dung, tẩy trống"
                        },
                        "level4": {
                            "label": "Xóa nội dung, tẩy trống",
                            "summary": "Cảnh báo cuối cùng: Xóa nội dung, tẩy trống"
                        },
                        "level4im": {
                            "label": "Xóa nội dung, tẩy trống",
                            "summary": "Cảnh báo duy nhất: Xóa nội dung, tẩy trống"
                        }
                    },
                    "uw-generic": {
                        "level4": {
                            "label": "Cảnh báo chung (đối với bản mẫu liên tiếp thiếu mức 4)",
                            "summary": "Thông báo cảnh báo cuối cùng"
                        }
                    }
                },
                "Hành vi trong bài viết": {
                    "uw-interlink": {
                        "level1": {
                            "label": "Liên kết ngoại ngữ",
                            "summary": "Lưu ý chung: Liên kết ngoại ngữ với bài dịch từ các dự án Wikipedia khác"
                        }
                    },
                    "uw-machinetranslation": {
                        "level1": {
                            "label": "Cảnh báo dịch máy",
                            "summary": "Lưu ý chung: Cảnh báo dịch máy với bài dịch từ các dự án Wikipedia khác"
                        }
                    },
                    "uw-biog": {
                        "level1": {
                            "label": "Thêm thông tin gây tranh cãi không nguồn về người sống",
                            "summary": "Lưu ý chung: Thêm thông tin gây tranh cãi không nguồn về người sống"
                        },
                        "level2": {
                            "label": "Thêm thông tin gây tranh cãi không nguồn về người sống",
                            "summary": "Cảnh báo: Thêm thông tin gây tranh cãi không nguồn về người sống"
                        },
                        "level3": {
                            "label": "Thêm thông tin gây tranh cãi/phỉ báng không nguồn về người sống",
                            "summary": "Cảnh báo: Thêm thông tin gây tranh cãi không nguồn về người sống"
                        },
                        "level4": {
                            "label": "Thêm thông tin gây tranh cãi/phỉ báng không nguồn về người sống",
                            "summary": "Cảnh báo cuối cùng: Thêm thông tin gây tranh cãi không nguồn về người sống"
                        },
                        "level4im": {
                            "label": "Thêm thông tin phỉ báng không nguồn về người sống",
                            "summary": "Cảnh báo duy nhất: Thêm thông tin gây tranh cãi không nguồn về người sống"
                        }
                    },
                    "uw-defamatory": {
                        "level1": {
                            "label": "Thêm vào nội dung phỉ báng",
                            "summary": "Lưu ý chung: Thêm vào nội dung phỉ báng"
                        },
                        "level2": {
                            "label": "Thêm vào nội dung phỉ báng",
                            "summary": "Cảnh báo: Thêm vào nội dung phỉ báng"
                        },
                        "level3": {
                            "label": "Thêm vào nội dung phỉ báng",
                            "summary": "Cảnh báo: Thêm vào nội dung phỉ báng"
                        },
                        "level4": {
                            "label": "Thêm vào nội dung phỉ báng",
                            "summary": "Cảnh báo cuối cùng: Thêm vào nội dung phỉ báng"
                        },
                        "level4im": {
                            "label": "Thêm vào nội dung phỉ báng",
                            "summary": "Cảnh báo duy nhất: Thêm vào nội dung phỉ báng"
                        }
                    },
                    "uw-error": {
                        "level1": {
                            "label": "Thêm thông tin sai",
                            "summary": "Lưu ý chung: Thêm thông tin sai"
                        },
                        "level2": {
                            "label": "Thêm thông tin sai",
                            "summary": "Cảnh báo: Thêm thông tin sai"
                        },
                        "level3": {
                            "label": "Thêm thông tin sai",
                            "summary": "Cảnh báo: Cố ý thêm thông tin sai"
                        },
                        "level4": {
                            "label": "Thêm thông tin sai",
                            "summary": "Cảnh báo cuối cùng: Cố ý thêm thông tin sai"
                        }
                    },
                    "uw-image": {
                        "level1": {
                            "label": "Phá hoại liên quan đến hình ảnh trong các bài viết",
                            "summary": "Lưu ý chung: Phá hoại liên quan đến hình ảnh trong các bài viết"
                        },
                        "level2": {
                            "label": "Phá hoại liên quan đến hình ảnh trong các bài viết",
                            "summary": "Cảnh báo: Phá hoại liên quan đến hình ảnh trong các bài viết"
                        },
                        "level3": {
                            "label": "Phá hoại liên quan đến hình ảnh trong các bài viết",
                            "summary": "Cảnh báo: Phá hoại liên quan đến hình ảnh trong các bài viết"
                        },
                        "level4": {
                            "label": "Phá hoại liên quan đến hình ảnh trong các bài viết",
                            "summary": "Cảnh báo cuối cùng: Phá hoại liên quan đến hình ảnh trong các bài viết"
                        },
                        "level4im": {
                            "label": "Phá hoại liên quan đến hình ảnh",
                            "summary": "Cảnh báo duy nhất: Image-related vandalism"
                        }
                    },
                    "uw-joke": {
                        "level1": {
                            "label": "Thêm nội dung hài hước, đùa giỡn vào bài",
                            "summary": "Lưu ý chung: Thêm nội dung hài hước, đùa giỡn vào bài"
                        },
                        "level2": {
                            "label": "Thêm nội dung hài hước, đùa giỡn vào bài",
                            "summary": "Cảnh báo: Thêm nội dung hài hước, đùa giỡn vào bài"
                        },
                        "level3": {
                            "label": "Thêm nội dung hài hước, đùa giỡn vào bài",
                            "summary": "Cảnh báo: Thêm nội dung hài hước, đùa giỡn vào bài"
                        },
                        "level4": {
                            "label": "Thêm nội dung hài hước, đùa giỡn vào bài",
                            "summary": "Cảnh báo cuối cùng: Thêm nội dung hài hước, đùa giỡn vào bài"
                        },
                        "level4im": {
                            "label": "Thêm nội dung hài hước, đùa giỡn vào bài",
                            "summary": "Cảnh báo duy nhất: Thêm nội dung hài hước, đùa giỡn vào bài"
                        }
                    },
                    "uw-nor": {
                        "level1": {
                            "label": "Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản",
                            "summary": "Lưu ý chung: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản"
                        },
                        "level2": {
                            "label": "Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản",
                            "summary": "Cảnh báo: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản"
                        },
                        "level3": {
                            "label": "Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản",
                            "summary": "Cảnh báo: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản"
                        },
                        "level4": {
                            "label": "Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản",
                            "summary": "Cảnh báo cuối cùng: Thêm nghiên cứu gốc, bao gồm tổng hợp các nguồn chưa được xuất bản"
                        }
                    },
                    "uw-notcensored": {
                        "level1": {
                            "label": "Kiểm duyệt tài liệu",
                            "summary": "Lưu ý chung: Kiểm duyệt tài liệu"
                        },
                        "level2": {
                            "label": "Kiểm duyệt tài liệu",
                            "summary": "Cảnh báo: Kiểm duyệt tài liệu"
                        },
                        "level3": {
                            "label": "Kiểm duyệt tài liệu",
                            "summary": "Cảnh báo: Kiểm duyệt tài liệu"
                        }
                    },
                    "uw-own": {
                        "level1": {
                            "label": "Sở hữu bài viết",
                            "summary": "Lưu ý chung: Sở hữu bài viết"
                        },
                        "level2": {
                            "label": "Sở hữu bài viết",
                            "summary": "Cảnh báo: Sở hữu bài viết"
                        },
                        "level3": {
                            "label": "Sở hữu bài viết",
                            "summary": "Cảnh báo: Sở hữu bài viết"
                        },
                        "level4": {
                            "label": "Sở hữu bài viết",
                            "summary": "Cảnh báo cuối cùng: Sở hữu bài viết"
                        },
                        "level4im": {
                            "label": "Sở hữu bài viết",
                            "summary": "Cảnh báo duy nhất: Sở hữu bài viết"
                        }
                    },
                    "uw-tdel": {
                        "level1": {
                            "label": "Xóa các bản mẫu bảo trì",
                            "summary": "Lưu ý chung: Xóa các bản mẫu bảo trì"
                        },
                        "level2": {
                            "label": "Xóa các bản mẫu bảo trì",
                            "summary": "Cảnh báo: Xóa các bản mẫu bảo trì"
                        },
                        "level3": {
                            "label": "Xóa các bản mẫu bảo trì",
                            "summary": "Cảnh báo: Xóa các bản mẫu bảo trì"
                        },
                        "level4": {
                            "label": "Xóa các bản mẫu bảo trì",
                            "summary": "Cảnh báo cuối cùng: Xóa các bản mẫu bảo trì"
                        }
                    },
                    "uw-unsourced": {
                        "level1": {
                            "label": "Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp",
                            "summary": "Lưu ý chung: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp"
                        },
                        "level2": {
                            "label": "Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp",
                            "summary": "Cảnh báo: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp"
                        },
                        "level3": {
                            "label": "Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp",
                            "summary": "Cảnh báo: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp"
                        },
                        "level4": {
                            "label": "Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp",
                            "summary": "Cảnh báo cuối cùng: Thêm tài liệu không có nguồn gốc hoặc được trích dẫn không thích hợp"
                        }
                    }
                },
                "Quảng cáo và thư rác": {
                    "uw-advert": {
                        "level1": {
                            "label": "Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi",
                            "summary": "Lưu ý chung: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi"
                        },
                        "level2": {
                            "label": "Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi",
                            "summary": "Cảnh báo: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi"
                        },
                        "level3": {
                            "label": "Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi",
                            "summary": "Cảnh báo: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi"
                        },
                        "level4": {
                            "label": "Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi",
                            "summary": "Cảnh báo cuối cùng: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi"
                        },
                        "level4im": {
                            "label": "Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi",
                            "summary": "Cảnh báo duy nhất: Sử dụng Wikipedia để quảng cáo hoặc khuyến mãi"
                        }
                    },
                    "uw-npov": {
                        "level1": {
                            "label": "Không tuân theo quan điểm trung lập",
                            "summary": "Lưu ý chung: Không tuân theo quan điểm trung lập"
                        },
                        "level2": {
                            "label": "Không tuân theo quan điểm trung lập",
                            "summary": "Cảnh báo: Không tuân theo quan điểm trung lập"
                        },
                        "level3": {
                            "label": "Không tuân theo quan điểm trung lập",
                            "summary": "Cảnh báo: Không tuân theo quan điểm trung lập"
                        },
                        "level4": {
                            "label": "Không tuân theo quan điểm trung lập",
                            "summary": "Cảnh báo cuối cùng: Không tuân theo quan điểm trung lập"
                        }
                    },
                    "uw-paid": {
                        "level1": {
                            "label": "Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia",
                            "summary": "Lưu ý chung: Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia"
                        },
                        "level2": {
                            "label": "Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia",
                            "summary": "Cảnh báo: Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia"
                        },
                        "level3": {
                            "label": "Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia",
                            "summary": "Cảnh báo: Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia"
                        },
                        "level4": {
                            "label": "Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia",
                            "summary": "Cảnh báo cuối cùng: Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia"
                        },
                        "level4im": {
                            "label": "Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia",
                            "summary": "Cảnh báo duy nhất: Chỉnh sửa nhận thù lao mà không khai báo theo Điều khoản sử dụng của Wikimedia"
                        }
                    },
                    "uw-spam": {
                        "level1": {
                            "label": "Thêm các liên kết bên ngoài không phù hợp",
                            "summary": "Lưu ý chung: Thêm các liên kết bên ngoài không phù hợp"
                        },
                        "level2": {
                            "label": "Thêm liên kết rác",
                            "summary": "Cảnh báo: Thêm liên kết rác"
                        },
                        "level3": {
                            "label": "Thêm liên kết rác",
                            "summary": "Cảnh báo: Thêm liên kết rác"
                        },
                        "level4": {
                            "label": "Thêm liên kết rác",
                            "summary": "Cảnh báo cuối cùng: Thêm liên kết rác"
                        },
                        "level4im": {
                            "label": "Thêm liên kết rác",
                            "summary": "Cảnh báo duy nhất: Thêm liên kết rác"
                        }
                    }
                },
                "Hành vi đối với các biên tập viên khác": {
                    "uw-agf": {
                        "level1": {
                            "label": "Không thiện chí",
                            "summary": "Lưu ý chung: Không thiện chí"
                        },
                        "level2": {
                            "label": "Không thiện chí",
                            "summary": "Cảnh báo: Không thiện chí"
                        },
                        "level3": {
                            "label": "Không thiện chí",
                            "summary": "Cảnh báo: Không thiện chí"
                        }
                    },
                    "uw-harass": {
                        "level1": {
                            "label": "Quấy rối người dùng khác",
                            "summary": "Lưu ý chung: Quấy rối người dùng khác"
                        },
                        "level2": {
                            "label": "Quấy rối người dùng khác",
                            "summary": "Cảnh báo: Quấy rối người dùng khác"
                        },
                        "level3": {
                            "label": "Quấy rối người dùng khác",
                            "summary": "Cảnh báo: Quấy rối người dùng khác"
                        },
                        "level4": {
                            "label": "Quấy rối người dùng khác",
                            "summary": "Cảnh báo cuối cùng: Quấy rối người dùng khác"
                        },
                        "level4im": {
                            "label": "Quấy rối người dùng khác",
                            "summary": "Cảnh báo duy nhất: Quấy rối người dùng khác"
                        }
                    },
                    "uw-npa": {
                        "level1": {
                            "label": "Tấn công cá nhân nhắm vào một biên tập viên cụ thể",
                            "summary": "Lưu ý chung: Tấn công cá nhân nhắm vào một biên tập viên cụ thể"
                        },
                        "level2": {
                            "label": "Tấn công cá nhân nhắm vào một biên tập viên cụ thể",
                            "summary": "Cảnh báo: Tấn công cá nhân nhắm vào một biên tập viên cụ thể"
                        },
                        "level3": {
                            "label": "Tấn công cá nhân nhắm vào một biên tập viên cụ thể",
                            "summary": "Cảnh báo: Tấn công cá nhân nhắm vào một biên tập viên cụ thể"
                        },
                        "level4": {
                            "label": "Tấn công cá nhân nhắm vào một biên tập viên cụ thể",
                            "summary": "Cảnh báo cuối cùng: Tấn công cá nhân nhắm vào một biên tập viên cụ thể"
                        },
                        "level4im": {
                            "label": "Tấn công cá nhân nhắm vào một biên tập viên cụ thể",
                            "summary": "Cảnh báo duy nhất: Tấn công cá nhân nhắm vào một biên tập viên cụ thể"
                        }
                    },
                    "uw-tempabuse": {
                        "level1": {
                            "label": "Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm",
                            "summary": "Lưu ý chung: Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm"
                        },
                        "level2": {
                            "label": "Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm",
                            "summary": "Cảnh báo: Sử dụng không đúng bản mẫu cảnh báo hoặc bản mẫu cấm"
                        }
                    }
                },
                "Xóa các thẻ xóa": {
                    "uw-afd": {
                        "level1": {
                            "label": "Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)",
                            "summary": "Lưu ý chung: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)"
                        },
                        "level2": {
                            "label": "Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)",
                            "summary": "Cảnh báo: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)"
                        },
                        "level3": {
                            "label": "Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)",
                            "summary": "Cảnh báo: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)"
                        },
                        "level4": {
                            "label": "Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)",
                            "summary": "Cảnh báo cuối cùng: Xóa các bản mẫu {{afd}} (biểu quyết xóa bài)"
                        }
                    },
                    "uw-blpprod": {
                        "level1": {
                            "label": "Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)",
                            "summary": "Lưu ý chung: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)"
                        },
                        "level2": {
                            "label": "Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)",
                            "summary": "Cảnh báo: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)"
                        },
                        "level3": {
                            "label": "Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)",
                            "summary": "Cảnh báo: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)"
                        },
                        "level4": {
                            "label": "Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)",
                            "summary": "Cảnh báo cuối cùng: Xóa các bản mẫu {{prod blp}} (đề nghị xóa tiểu sử người còn sống không nguồn)"
                        }
                    },
                    "uw-idt": {
                        "level1": {
                            "label": "Xóa các thẻ xóa tập tin",
                            "summary": "Lưu ý chung: Xóa các thẻ xóa tập tin"
                        },
                        "level2": {
                            "label": "Xóa các thẻ xóa tập tin",
                            "summary": "Cảnh báo: Xóa các thẻ xóa tập tin"
                        },
                        "level3": {
                            "label": "Xóa các thẻ xóa tập tin",
                            "summary": "Cảnh báo: Xóa các thẻ xóa tập tin"
                        },
                        "level4": {
                            "label": "Xóa các thẻ xóa tập tin",
                            "summary": "Cảnh báo cuối cùng: Xóa các thẻ xóa tập tin"
                        }
                    },
                    "uw-speedy": {
                        "level1": {
                            "label": "Xóa các thẻ xóa nhanh",
                            "summary": "Lưu ý chung: Xóa các thẻ xóa nhanh"
                        },
                        "level2": {
                            "label": "Xóa các thẻ xóa nhanh",
                            "summary": "Cảnh báo: Xóa các thẻ xóa nhanh"
                        },
                        "level3": {
                            "label": "Xóa các thẻ xóa nhanh",
                            "summary": "Cảnh báo: Xóa các thẻ xóa nhanh"
                        },
                        "level4": {
                            "label": "Xóa các thẻ xóa nhanh",
                            "summary": "Cảnh báo cuối cùng: Xóa các thẻ xóa nhanh"
                        }
                    }
                },
                "Hình ảnh, tập tin": {
                    "uw-ics": {
                        "level1": {
                            "label": "Tải tập tin thiếu nguồn và giấy phép",
                            "summary": "Lưu ý chung: Tải tập tin thiếu nguồn và giấy phép"
                        },
                        "level2": {
                            "label": "Tải tập tin thiếu nguồn và giấy phép",
                            "summary": "Cảnh báo: Tải tập tin thiếu nguồn và giấy phép"
                        },
                        "level3": {
                            "label": "Tải tập tin thiếu nguồn và giấy phép",
                            "summary": "Cảnh báo: Tải tập tin thiếu nguồn và giấy phép"
                        },
                        "level4": {
                            "label": "Tải tập tin thiếu nguồn và giấy phép",
                            "summary": "Cảnh báo cuối cùng: Tải tập tin thiếu nguồn và giấy phép"
                        },
                        "level4im": {
                            "label": "Tải tập tin thiếu nguồn và giấy phép",
                            "summary": "Cảnh báo duy nhất: Tải tập tin thiếu nguồn và giấy phép"
                        }
                    },
                    "uw-upload": {
                        "level1": {
                            "label": "Tải hình ảnh không bách khoa",
                            "summary": "Lưu ý chung: Tải hình ảnh không bách khoa"
                        },
                        "level2": {
                            "label": "Tải hình ảnh không bách khoa",
                            "summary": "Cảnh báo: Tải hình ảnh không bách khoa"
                        },
                        "level3": {
                            "label": "Tải hình ảnh không bách khoa",
                            "summary": "Cảnh báo: Tải hình ảnh không bách khoa"
                        },
                        "level4": {
                            "label": "Tải hình ảnh không bách khoa",
                            "summary": "Cảnh báo cuối cùng: Tải hình ảnh không bách khoa"
                        },
                        "level4im": {
                            "label": "Tải hình ảnh không bách khoa",
                            "summary": "Cảnh báo duy nhất: Tải hình ảnh không bách khoa"
                        }
                    }
                },
                "Khác": {
                    "uw-chat": {
                        "level1": {
                            "label": "Biến trang thảo luận thành diễn đàn",
                            "summary": "Lưu ý chung: Biến trang thảo luận thành diễn đàn"
                        },
                        "level2": {
                            "label": "Biến trang thảo luận thành diễn đàn",
                            "summary": "Cảnh báo: Biến trang thảo luận thành diễn đàn"
                        },
                        "level3": {
                            "label": "Biến trang thảo luận thành diễn đàn",
                            "summary": "Cảnh báo: Biến trang thảo luận thành diễn đàn"
                        },
                        "level4": {
                            "label": "Biến trang thảo luận thành diễn đàn",
                            "summary": "Cảnh báo cuối cùng: Biến trang thảo luận thành diễn đàn"
                        }
                    },
                    "uw-create": {
                        "level1": {
                            "label": "Tạo các trang không hợp lệ",
                            "summary": "Lưu ý chung: Tạo các trang không hợp lệ"
                        },
                        "level2": {
                            "label": "Tạo các trang không hợp lệ",
                            "summary": "Cảnh báo: Tạo các trang không hợp lệ"
                        },
                        "level3": {
                            "label": "Tạo các trang không hợp lệ",
                            "summary": "Cảnh báo: Tạo các trang không hợp lệ"
                        },
                        "level4": {
                            "label": "Tạo các trang không hợp lệ",
                            "summary": "Cảnh báo cuối cùng: Tạo các trang không hợp lệ"
                        },
                        "level4im": {
                            "label": "Tạo các trang không hợp lệ",
                            "summary": "Cảnh báo duy nhất: Tạo các trang không hợp lệ"
                        }
                    },
                    "uw-mos": {
                        "level1": {
                            "label": "Cẩm nang biên soạn",
                            "summary": "Lưu ý chung: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)"
                        },
                        "level2": {
                            "label": "Cẩm nang biên soạn",
                            "summary": "Cảnh báo: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)"
                        },
                        "level3": {
                            "label": "Cẩm nang biên soạn",
                            "summary": "Cảnh báo: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)"
                        },
                        "level4": {
                            "label": "Cẩm nang biên soạn",
                            "summary": "Cảnh báo cuối cùng: Định dạng, ngày tháng, ngôn ngữ, v.v. ( Phong cách thủ công)"
                        }
                    },
                    "uw-move": {
                        "level1": {
                            "label": "Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận",
                            "summary": "Lưu ý chung: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận"
                        },
                        "level2": {
                            "label": "Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận",
                            "summary": "Cảnh báo: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận"
                        },
                        "level3": {
                            "label": "Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận",
                            "summary": "Cảnh báo: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận"
                        },
                        "level4": {
                            "label": "Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận",
                            "summary": "Cảnh báo cuối cùng: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận"
                        },
                        "level4im": {
                            "label": "Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận",
                            "summary": "Cảnh báo duy nhất: Di chuyển trang trái với các quy ước đặt tên hoặc sự đồng thuận"
                        }
                    },
                    "uw-plotsum": {
                        "level1": {
                            "label": "Khiến tóm lược cốt truyện dài dòng và tiểu tiết",
                            "summary": "Lưu ý chung: Khiến tóm lược cốt truyện dài dòng và tiểu tiết"
                        },
                        "level2": {
                            "label": "Khiến tóm lược cốt truyện dài dòng và tiểu tiết",
                            "summary": "Lưu ý: Khiến tóm lược cốt truyện dài dòng và tiểu tiết"
                        },
                        "level3": {
                            "label": "Khiến tóm lược cốt truyện dài dòng và tiểu tiết",
                            "summary": "Lưu ý: Khiến tóm lược cốt truyện dài dòng và tiểu tiết"
                        }
                    },
                    "uw-tpv": {
                        "level1": {
                            "label": "Phá hoại hay xóa thảo luận của người khác",
                            "summary": "Lưu ý chung: Phá hoại hay xóa thảo luận của người khác"
                        },
                        "level2": {
                            "label": "Phá hoại hay xóa thảo luận của người khác",
                            "summary": "Lưu ý: Phá hoại hay xóa thảo luận của người khác"
                        },
                        "level3": {
                            "label": "Phá hoại hay xóa thảo luận của người khác",
                            "summary": "Cảnh báo: Phá hoại hay xóa thảo luận của người khác"
                        },
                        "level4": {
                            "label": "Phá hoại hay xóa thảo luận của người khác",
                            "summary": "Cảnh báo cuối cùng: Phá hoại hay xóa thảo luận của người khác"
                        },
                        "level4im": {
                            "label": "Phá hoại hay xóa thảo luận của người khác",
                            "summary": "Cảnh báo duy nhất: Phá hoại hay xóa thảo luận của người khác"
                        }
                    }
                }
            },
            "singlenotice": {
                "uw-aiv": {
                    "label": "Báo cáo AIV không hợp lệ",
                    "summary": "Thông báo: Bad AIV report"
                },
                "uw-autobiography": {
                    "label": "Tạo tự truyện",
                    "summary": "Thông báo: Tạo tự truyện"
                },
                "uw-badcat": {
                    "label": "Thêm thể loại không chính xác",
                    "summary": "Thông báo: Thêm thể loại không chính xác"
                },
                "uw-badlistentry": {
                    "label": "Thêm các mục không phù hợp vào danh sách",
                    "summary": "Thông báo: Thêm các mục không phù hợp vào danh sách"
                },
                "uw-bite": {
                    "label": "\"Cắn\" người mới đến",
                    "summary": "Thông báo: \"Cắn\" người mới đến",
                    "suppressArticleInSummary": true
                },
                "uw-coi": {
                    "label": "Xung đột lợi ích",
                    "summary": "Thông báo: Xung đột lợi ích",
                    "heading": "Xung đột lợi ích"
                },
                "uw-controversial": {
                    "label": "Sửa đổi gây tranh cãi",
                    "summary": "Thông báo: Sửa đổi gây tranh cãi"
                },
                "uw-editsummary": {
                    "label": "Thiếu tóm lược sửa đổi",
                    "summary": "Thông báo: Thiếu tóm lược sửa đổi"
                },
                "uw-elinbody": {
                    "label": "Thêm liên kết ngoài vào thân bài",
                    "summary": "Thông báo: Để các liên kết ngoài tại phần Liên kết ngoài ở cuối bài"
                },
                "uw-vietnamese": {
                    "label": "Không giao tiếp bằng tiếng Việt",
                    "summary": "Thông báo: Không giao tiếp bằng tiếng Việt"
                },
                "uw-hasty": {
                    "label": "Thêm các thẻ xóa quá nhanh",
                    "summary": "Thông báo: Cho phép người tạo bài có thời gian để cải thiện bài viết trước khi gắn thẻ xóa bài"
                },
                "uw-italicize": {
                    "label": "In nghiêng sách, phim, album, tạp chí, phim truyền hình, v.v. trong các bài viết",
                    "summary": "Thông báo: Hãy in nghiêng sách, phim, album, tạp chí, phim truyền hình, v.v. trong các bài viết"
                },
                "uw-lang": {
                    "label": "Không cần phải thay đổi giữa tiếng Việt miền Bắc và tiếng Việt miền Nam",
                    "summary": "Thông báo: Không cần phải thay đổi giữa tiếng Việt miền Bắc và tiếng Việt miền Nam",
                    "heading": "Các địa phương sử dụng tiếng Việt"
                },
                "uw-linking": {
                    "label": "Thêm quá nhiều liên kết đỏ hoặc liên kết xanh lặp lại",
                    "summary": "Thông báo: Thêm quá nhiều liên kết đỏ hoặc liên kết xanh lặp lại"
                },
                "uw-minor": {
                    "label": "Sử dụng sai hộp kiểm tra các chỉnh sửa nhỏ",
                    "summary": "Thông báo: Sử dụng sai hộp kiểm tra các chỉnh sửa nhỏ"
                },
                "uw-notvietnamese": {
                    "label": "Tạo các bài viết không phải tiếng Việt",
                    "summary": "Thông báo: Tạo các bài viết không phải tiếng Việt"
                },
                "uw-notvote": {
                    "label": "Chúng tôi xét đồng thuận chứ không đếm phiếu",
                    "summary": "Thông báo: Chúng tôi xét đồng thuận chứ không đếm phiếu"
                },
                "uw-plagiarism": {
                    "label": "Sao chép từ các nguồn từ phạm vi công cộng mà không cần ghi công",
                    "summary": "Thông báo: Sao chép từ các nguồn từ phạm vi công cộng mà không cần ghi công"
                },
                "uw-preview": {
                    "label": "Sử dụng nút xem trước để tránh nhầm lẫn",
                    "summary": "Thông báo: Sử dụng nút xem trước để tránh nhầm lẫn"
                },
                "uw-redlink": {
                    "label": "Xóa liên kết đỏ bừa bãi",
                    "summary": "Thông báo: Xóa liên kết đỏ bừa bãi"
                },
                "uw-selfrevert": {
                    "label": "Tự thử nghiệm lùi lại quá mức",
                    "summary": "Thông báo: Tự thử nghiệm lùi lại quá mức"
                },
                "uw-socialnetwork": {
                    "label": "Wikipedia không phải là một mạng xã hội",
                    "summary": "Thông báo: Wikipedia không phải là một mạng xã hội"
                },
                "uw-sofixit": {
                    "label": "Hãy mạnh dạn và tự sửa chữa mọi thứ",
                    "summary": "Thông báo: Hãy mạnh dạn và tự sửa chữa mọi thứ"
                },
                "uw-talkinarticle": {
                    "label": "Thảo luận trong bài viết",
                    "summary": "Thông báo: Thảo luận trong bài viết"
                },
                "uw-taxonomy1": {
                    "label": "Sửa đổi khiến cho bản mẫu phân loại sinh vật bị lỗi",
                    "summary": "Thông báo: Sửa đổi khiến cho bản mẫu phân loại sinh vật bị lỗi"
                },
                "uw-tilde": {
                    "label": "Đăng nội dung (thảo luận) không ký tên",
                    "summary": "Thông báo: Đăng nội dung (thảo luận) không ký tên"
                },
                "uw-toppost": {
                    "label": "Đăng ở đầu các trang thảo luận",
                    "summary": "Thông báo: Đăng ở đầu các trang thảo luận"
                },
                "uw-userspace draft finish": {
                    "label": "Bản nháp không gian người dùng cũ",
                    "summary": "Thông báo: Bản nháp không gian người dùng cũ"
                },
                "uw-vgscope": {
                    "label": "Thêm hướng dẫn cách chơi trò chơi điện tử, mẹo gian lận hoặc chỉ dẫn",
                    "summary": "Thông báo: Thêm hướng dẫn cách chơi trò chơi điện tử, mẹo gian lận hoặc chỉ dẫn"
                },
                "uw-warn": {
                    "label": "Đặt các bản mẫu cảnh báo người dùng khi lùi lại hành vi phá hoại",
                    "summary": "Thông báo: Bạn có thể sử dụng các bản mẫu cảnh báo người dùng khi lùi lại hành vi phá hoại"
                }
            },
            "singlewarn": {
                "uw-3rr": {
                    "label": "Vi phạm quy tắc ba lần hồi sửa; Xem thêm uw-ew",
                    "summary": "Cảnh báo: ba lần hồi sửa"
                },
                "uw-affiliate": {
                    "label": "Tiếp thị liên kết",
                    "summary": "Cảnh báo: Tiếp thị liên kết"
                },
                "uw-agf-sock": {
                    "label": "Sử dụng nhiều tài khoản (giả sử có thiện chí)",
                    "summary": "Cảnh báo: Sử dụng nhiều tài khoản"
                },
                "uw-attack": {
                    "label": "Tạo các trang tấn công",
                    "summary": "Cảnh báo: Tạo các trang tấn công",
                    "suppressArticleInSummary": true
                },
                "uw-botun": {
                    "label": "Tên người dùng bot",
                    "summary": "Cảnh báo: Tên người dùng bot"
                },
                "uw-canvass": {
                    "label": "Vận động",
                    "summary": "Cảnh báo: Vận động"
                },
                "uw-copyright": {
                    "label": "Vi phạm bản quyền",
                    "summary": "Cảnh báo: Vi phạm bản quyền"
                },
                "uw-copyright-link": {
                    "label": "Liên kết đến các vi phạm tác phẩm có bản quyền",
                    "summary": "Cảnh báo: Liên kết đến các vi phạm tác phẩm có bản quyền"
                },
                "uw-efsummary": {
                    "label": "Tóm lược sửa đổi kích hoạt bộ lọc chỉnh sửa",
                    "summary": "Cảnh báo: Tóm lược sửa đổi kích hoạt bộ lọc chỉnh sửa"
                },
                "uw-ewsoft": {
                    "label": "Bút chiến (diễn đạt mức độ nhẹ với người mới)",
                    "summary": "Cảnh báo: Bút chiến"
                },
                "uw-hoax": {
                    "label": "Tạo trò lừa bịp",
                    "summary": "Cảnh báo: Tạo trò lừa bịp"
                },
                "uw-legal": {
                    "label": "Đe dọa pháp lý",
                    "summary": "Cảnh báo: Đe dọa pháp lý"
                },
                "uw-login": {
                    "label": "Chỉnh sửa khi đăng xuất",
                    "summary": "Cảnh báo: Chỉnh sửa khi đăng xuất"
                },
                "uw-multipleIPs": {
                    "label": "Sử dụng nhiều IP",
                    "summary": "Cảnh báo: Phá hoại với nhiều IP"
                },
                "uw-pinfo": {
                    "label": "Đăng thông tin cá nhân (của người khác)",
                    "summary": "Cảnh báo: Thông tin cá nhân"
                },
                "uw-salt": {
                    "label": "Tạo lại các bài bị khóa khởi tạo dưới một tiêu đề khác",
                    "summary": "Thông báo: Tạo lại các bài bị khóa khởi tạo dưới một tiêu đề khác"
                },
                "uw-socksuspect": {
                    "label": "Con rối",
                    "summary": "Cảnh báo: Bạn là một người bị nghi ngờ [[Wikipedia:Tài khoản con rối]]"
                },
                "uw-upv": {
                    "label": "Phá hoại trang thành viên",
                    "summary": "Cảnh báo: Phá hoại trang thành viên"
                },
                "uw-username": {
                    "label": "Tên người dùng vi phạm quy định (nên ghi lý do)",
                    "summary": "Cảnh báo: Tên người dùng vi phạm quy định",
                    "suppressArticleInSummary": true
                },
                "uw-coi-username": {
                    "label": "Tên người dùng vi phạm quy định và xung đột lợi ích",
                    "summary": "Cảnh báo: Tên người dùng vi phạm quy định và xung đột lợi ích",
                    "heading": "Tên người dùng của bạn"
                },
                "uw-userpage": {
                    "label": "Trang người dùng hoặc trang con vi phạm quy định",
                    "summary": "Cảnh báo: Trang người dùng hoặc trang con vi phạm quy định"
                }
            }
        };

        let groupObject: warningLevel['list'] = {
            'Cảnh báo/Nhắc nhở chung': [],
            'Hành vi trong bài viết': [],
            'Quảng cáo và thư rác': [],
            'Hành vi đối với các biên tập viên khác': [],
            'Xóa các thẻ xóa': [],
            'Hình ảnh, tập tin': [],
            'Khác': [],
        };

        let groups: Record<string, warningLevel> = {
            level1: {
                label: 'Cấp độ 1: Lưu ý chung',
                list: $.extend(true, {}, groupObject),
            },
            level2: {
                label: 'Cấp độ 2: Chú ý',
                list: $.extend(true, {}, groupObject),
            },
            level3: {
                label: 'Cấp độ 3: Cảnh báo',
                list: $.extend(true, {}, groupObject),
            },
            level4: {
                label: 'Cấp độ 4: Cảnh báo cuối cùng',
                list: $.extend(true, {}, groupObject),
            },
            level4im: {
                label: 'Cấp độ 4im: Cảnh báo một lần duy nhất',
                list: $.extend(true, {}, groupObject),
            },
        };

        const toWarning = (name: string, data: MessageConfig): warning => ({
            template: name,
            ...data,
            inputConfig: this.getInputConfig(name),
        });

        if (getPref('combinedSingletMenus')) {
            groups.singlecombined = {
                label: 'Tin nhắn về một vấn đề',
                list: obj_entries(messages.singlenotice)
                    .concat(obj_entries(messages.singlewarn))
                    .sort(([nameA], [nameB]) => (nameA < nameB ? -1 : 1))
                    .map(([name, data]) => toWarning(name, data)),
            };
        } else {
            groups.singlenotice = {
                label: 'Thông báo về một vấn đề',
                list: obj_entries(messages.singlenotice).map(([name, data]) => toWarning(name, data)),
            };

            groups.singlewarn = {
                label: 'Cảnh báo một vấn đề',
                list: obj_entries(messages.singlewarn).map(([name, data]) => toWarning(name, data)),
            };
        }

        for (let [subgroupName, templateSet] of obj_entries(messages.levels)) {
            for (let [templateName, templateLevels] of obj_entries(templateSet)) {
                for (let [level, templateData] of obj_entries(templateLevels)) {
                    const template = templateName + level.slice('level'.length);
                    const subgroup = groups[level].list as Record<string, warning[]>;
                    subgroup[subgroupName].push(toWarning(template, templateData));
                }
            }
        }

        this.warnings = groups;
    }

    getWarningWikitext(templateName: string, article: string, reason: string, isCustom: boolean) {
        let text = '{{subst:' + templateName;

        if (article) {
            if (templateName === 'uw-c&pmove') {
                text += '|to=' + article;
            } else {
                text += '|1=' + article;
            }
        }

        if (reason && !isCustom) {
            if (
                templateName === 'uw-csd' ||
                templateName === 'uw-probation' ||
                templateName === 'uw-userspacenoindex' ||
                templateName === 'uw-userpage'
            ) {
                text += "|3=''" + reason + "''";
            } else {
                text += "|2=''" + reason + "''";
            }
        }

        text += '}}';

        if (reason && isCustom) {
            text += " ''" + reason + "''";
        }

        return text + ' ~~~~';
    }

    validateInputs(params: any) {
        if (params.sub_group === 'uw-username' && !params.article) {
            return 'Bạn phải cung cấp lý do cho bản mẫu {{uw-username}}.';
        }
    }

    getHistoryRegex(): RegExp {
        return /<!--\s?Template:([uU]w-.*?)\s?-->.*?(\d{1,2}:\d{1,2}, \d{1,2} \w+ \d{4} \(UTC\))/g;
    }

    getInputConfig(template: string) {
        let input = super.getInputConfig(template);

        switch (template) {
            case 'uw-agf-sock':
                input.label =
                    'Tên người dùng tùy chọn của tài khoản khác (không có Thành viên:) ';
                input.className = 'userInput';
                break;

            case 'uw-bite':
                input.label =
                    "Tên người dùng của thành viên bị đối xử thô lỗ (không có Thành viên:) ";
                input.className = 'userInput';
                break;

            case 'uw-socksuspect':
                input.label =
                    'Tên người dùng của chủ rối, nếu biết (không có Thành viên:) ';
                input.className = 'userInput';
                break;

            case 'uw-username':
                input.label = 'Tên người dùng vi phạm quy định vì... ';
                break;

            case 'uw-aiv':
                input.label =
                    'Tên người dùng tùy chọn đã được báo cáo (không có Thành viên:) ';
                input.className = 'userInput';
                break;
        }

        return input;
    }

    customiseSummaryWithInput(summary: string, input: string, messageData: warning) {
        if (
            ['uw-agf-sock', 'uw-socksuspect', 'uw-aiv'].indexOf(
                messageData.template || ''
            ) !== -1
        ) {
            return summary + ' của [[:User:' + input + ']]';
        }

        return super.customiseSummaryWithInput(summary, input, messageData);
    }

    perWarningNotices(template: string): JQuery {
        switch (template) {
            case 'uw-username':
                return $(
                    "<div style='color: red;' id='tw-warn-red-notice'>{{uw-username}} không nên được sử dụng cho các trường hợp vi phạm quy định về tên người dùng rõ ràng. " +
                    "Những trường hợp rõ ràng nên được báo cáo trực tiếp tới TNCBQV (thông qua menu Báo cáo của Twinkle). " +
                    '{{uw-username}} chỉ nên được dùng trong các trường hợp cần trao đổi với người dùng.</div>'
                );

            case 'uw-coi-username':
                return $(
                    "<div style='color: red;' id='tw-warn-red-notice'>{{uw-coi-username}} không nên được sử dụng cho các trường hợp vi phạm quy định về tên người dùng rõ ràng. " +
                    "Những trường hợp rõ ràng nên được báo cáo trực tiếp tới TNCBQV (thông qua menu Báo cáo của Twinkle). " +
                    '{{uw-coi-username}} chỉ nên được dùng trong các trường hợp cần trao đổi với người dùng.</div>'
                );

            default:
                return $();
        }
    }
}
