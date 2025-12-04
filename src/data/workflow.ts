import type { WorkflowDefinition } from '../types/workflow';

export const experimentalWorkflow: WorkflowDefinition = {
    nodes: [
        {
            id: "step-1",
            title: "1. 試験片準備",
            type: "process",
            icon: "ClipboardList",
            subProcesses: [
                {
                    id: "1.1",
                    title: "試験片購入",
                    contents: [
                        { id: "c-1-1-1", type: "text", text: "在庫確認後、先生に発注依頼。", required: false }
                    ]
                },
                {
                    id: "1.2",
                    title: "試験片加工",
                    contents: [
                        { id: "c-1-2-1", type: "text", text: "茶木さんにワイヤーカット依頼 -> 多軸加工機で溝加工", required: false },
                        { id: "c-1-2-2", type: "text", text: "粗さ測定(ymin 200±5μm)", required: false }
                    ]
                },
                {
                    id: "1.3",
                    title: "試験片測定",
                    contents: [
                        { id: "c-1-3-1", type: "text", text: "形状測定器(x=0基準, 溝中央)、粗さ測定器(溝内3箇所)。データはUSB経由でサーバーへ。", required: false },
                        { id: "c-1-3-2", type: "warning", text: "[注意]測定方法は年により異なるため要確認。", required: false },
                        { id: "c-1-3-3", type: "warning", text: "[注意]前日から温度平衡させる。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-2",
            title: "2. ワークの準備",
            type: "process",
            icon: "Box",
            subProcesses: [
                {
                    id: "2.1",
                    title: "洗浄と初期重量測定",
                    contents: [
                        { id: "c-2-1-1", type: "text", text: "超音波洗浄 -> エアブロー乾燥 -> 重量測定(3回) -> Excel入力 -> バックアップ保存。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-3",
            title: "3. 実験装置のセットアップ",
            type: "process",
            icon: "Settings",
            subProcesses: [
                {
                    id: "3.1",
                    title: "機器起動",
                    contents: [
                        { id: "c-3-1-1", type: "text", text: "モーター、モニター、PC、トルク計、タイマー等の電源ON。(電場印加時は電源装置も)", required: false }
                    ]
                },
                {
                    id: "3.2",
                    title: "ワーク設置・ゼロ点合わせ",
                    contents: [
                        { id: "c-3-2-1", type: "text", text: "治具固定 -> 通電テスター接続 -> Z軸調整でゼロ点特定 -> 座標記録。", required: false }
                    ]
                },
                {
                    id: "3.3",
                    title: "ステージティーチング",
                    contents: [
                        { id: "c-3-3-1", type: "text", text: "-10.00mm移動設定", required: false },
                        { id: "c-3-3-2", type: "warning", text: "[重要]チェックボックス解除(指差確認)", required: false },
                        { id: "c-3-3-3", type: "text", text: "電流計配線。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-4",
            title: "4. 流体の塗布",
            type: "process",
            icon: "Droplet",
            subProcesses: [
                {
                    id: "4.1",
                    title: "準備",
                    contents: [
                        { id: "c-4-1-1", type: "text", text: "スポイト加工 -> 総重量測定 -> 塗布量計算。", required: false }
                    ]
                },
                {
                    id: "4.2",
                    title: "塗布・均し",
                    contents: [
                        { id: "c-4-2-1", type: "text", text: "200rpm回転 -> 塗布(誤差±0.3g) -> ステージ操作で流体を均す -> 高さ合わせ -> トルク計ゼロ点。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-5",
            title: "5. 研磨工程",
            type: "process",
            icon: "PlayCircle",
            subProcesses: [
                {
                    id: "5.1",
                    title: "実行",
                    contents: [
                        { id: "c-5-1-1", type: "text", text: "台移動ON -> モニター記録開始 -> ストップウォッチ/モーター開始 -> (電場印加開始)。", required: false }
                    ]
                },
                {
                    id: "5.2",
                    title: "異常時対応",
                    contents: [
                        { id: "c-5-2-1", type: "warning", text: "停止時は時間記録して中断。電流不安定時も中断。データ保存。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-6",
            title: "6. 後片付けとデータ保存",
            type: "process",
            icon: "Save",
            subProcesses: [
                {
                    id: "6.1",
                    title: "終了処置",
                    contents: [
                        { id: "c-6-1-1", type: "text", text: "回転停止 -> 記録終了 -> 電源OFF -> ワーク取り外し。", required: false }
                    ]
                },
                {
                    id: "6.2",
                    title: "事後測定",
                    contents: [
                        { id: "c-6-2-1", type: "text", text: "洗浄(6分) -> 乾燥 -> 重量測定(3回) -> 入力。", required: false }
                    ]
                },
                {
                    id: "6.3",
                    title: "データ保存",
                    contents: [
                        { id: "c-5-1-1", type: "text", text: "命名規則(δ-n-V-t)に従い保存。", required: false }
                    ]
                },
                {
                    id: "6.4",
                    title: "終了",
                    contents: [
                        { id: "c-6-4-1", type: "text", text: "清掃 -> 電源OFF -> 試験片保管(翌日の測定用)。", required: false }
                    ]
                }
            ]
        },
        {
            id: "step-7",
            title: "7. データ解析",
            type: "process",
            icon: "Monitor",
            subProcesses: [
                {
                    id: "7.1",
                    title: "実験後測定",
                    contents: [
                        { id: "c-7-1-1", type: "text", text: "2次元測定。", required: false }
                    ]
                },
                {
                    id: "7.2",
                    title: "解析ソフト操作",
                    contents: [
                        { id: "c-7-2-1", type: "text", text: "ファイル選択 -> データ閲覧 -> 真円度解析 -> 表面粗さ解析(範囲指定) -> グラフ設定(軸ラベル等) -> 保存。", required: false }
                    ]
                }
            ]
        },
        {
            id: "decision-loop",
            title: "次回の実験判断",
            type: "decision",
            icon: "GitBranch",
            subProcesses: [
                {
                    id: "loop-check",
                    title: "試験片在庫の確認",
                    contents: [
                        { id: "c-loop-1", type: "text", text: "実験終了後、次回の実験のために試験片の有無を確認してください。", required: false }
                    ]
                }
            ],
            decisionOptions: [
                { label: "試験片がない (1. 試験片準備へ)", targetNodeId: "step-1" },
                { label: "試験片がある (2. ワーク準備へ)", targetNodeId: "step-2" }
            ]
        }
    ],
    edges: [
        { id: "e1-2", source: "step-1", target: "step-2" },
        { id: "e2-3", source: "step-2", target: "step-3" },
        { id: "e3-4", source: "step-3", target: "step-4" },
        { id: "e4-5", source: "step-4", target: "step-5" },
        { id: "e5-6", source: "step-5", target: "step-6" },
        { id: "e6-7", source: "step-6", target: "step-7" },
        { id: "e7-d", source: "step-7", target: "decision-loop" },
        { id: "ed-1", source: "decision-loop", target: "step-1" },
        { id: "ed-2", source: "decision-loop", target: "step-2" }
    ]
};
