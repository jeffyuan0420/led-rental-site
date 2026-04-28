import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "NotoSansTC",
  src: path.join(process.cwd(), "public", "fonts", "NotoSansTC-Regular.woff"),
});

export interface ContractData {
  name: string;
  company?: string;
  id_number: string;
  customer_address: string;
  product_type: "single" | "triple";
  quantity: number;
  start_date: string;
  end_date: string;
  days: number;
  delivery_address: string;
  setup_option: "none" | "half" | "full";
  setup_persons: number;
  invoice_type: "personal" | "company";
  invoice_company?: string;
  invoice_tax_id?: string;
  invoice_address?: string;
  contract_date: string;
}

function toROCDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return { year: d.getFullYear() - 1911, month: d.getMonth() + 1, day: d.getDate() };
}
function p2(n: number) { return String(n).padStart(2, "0"); }

const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSansTC",
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 55,
    paddingRight: 55,
    lineHeight: 1.8,
    color: "#111",
  },
  title: { fontSize: 18, textAlign: "center", marginBottom: 18, letterSpacing: 2 },
  // 頂端立契約書人
  partyRow: { flexDirection: "row", marginBottom: 2, alignItems: "flex-start" },
  partyLabel: { width: 70, fontSize: 10 },
  partyRight: { flex: 1 },
  partyLine: { borderBottom: "1 solid #555", marginBottom: 2, paddingBottom: 1 },
  // 條文
  intro: { marginBottom: 10, textIndent: 20 },
  artRow: { flexDirection: "row", marginTop: 10, marginBottom: 3 },
  artNum: { width: 72, fontSize: 10 },
  artTitle: { flex: 1, fontSize: 10 },
  para: { marginBottom: 4, marginLeft: 72 },
  item: { flexDirection: "row", marginBottom: 3, marginLeft: 72 },
  itemNum: { width: 22 },
  itemBody: { flex: 1 },
  subItem: { flexDirection: "row", marginBottom: 2, marginLeft: 22 },
  subNum: { width: 24 },
  subBody: { flex: 1 },
  chk: { flexDirection: "row", marginBottom: 2, marginLeft: 86 },
  chkLabel: { flex: 1 },
  // 簽署區
  sigSection: { marginTop: 20 },
  sigLabel: { fontSize: 10, marginBottom: 8 },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  sigBox: { width: "47%", border: "1 solid #555", padding: 10, lineHeight: 2 },
  sigBoxTitle: { fontSize: 10, marginBottom: 4 },
  dateRow: { marginTop: 18, flexDirection: "row", justifyContent: "center", gap: 24 },
  pageNum: { position: "absolute", bottom: 22, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#888" },
  underline: { borderBottom: "1 solid #555" },
});

const CHK = "■";
const UNK = "□";
const BLANK = "________________________";

export function ContractPDF({ data }: { data: ContractData }) {
  const start = toROCDate(data.start_date);
  const end = toROCDate(data.end_date);
  const today = toROCDate(data.contract_date);
  const isSingle = data.product_type === "single";
  const isTriple = data.product_type === "triple";

  return (
    <Document>
      {/* ===== 第 1 頁 ===== */}
      <Page style={s.page}>
        <Text style={s.title}>設備租賃契約</Text>

        {/* 立契約書人 — 頂端 */}
        <View style={s.partyRow}>
          <Text style={s.partyLabel}>立契約書人</Text>
          <View style={s.partyRight}>
            <View style={s.partyLine}>
              <Text>鉅財王數位科技股份有限公司　　（下稱甲方）</Text>
            </View>
            <View style={s.partyLine}>
              <Text>{data.company ? `${data.company}（代表人：${data.name}）` : data.name}　　（下稱乙方）</Text>
            </View>
          </View>
        </View>

        {/* 前言 */}
        <Text style={[s.intro, { marginTop: 10 }]}>
          {"　　緣甲方同意以設備租與乙方使用收益，乙方同意支付租金，遂雙方合意簽訂本契約，約定事項如下："}
        </Text>

        {/* 第一條 */}
        <View style={s.artRow}><Text style={s.artNum}>第一條</Text><Text style={s.artTitle}>租賃標的物與數量</Text></View>
        <Text style={s.para}>甲方同意將下列設備租與乙方使用收益：</Text>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{isSingle ? CHK : UNK}兩折機，{isSingle ? `${data.quantity}` : "　　　"}台。</Text>
        </View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{isTriple ? CHK : UNK}三折雙面機，{isTriple ? `${data.quantity}` : "　　　"}台。</Text>
        </View>

        {/* 第二條 */}
        <View style={s.artRow}><Text style={s.artNum}>第二條</Text><Text style={s.artTitle}>租期</Text></View>
        <Text style={s.para}>
          {`承租期間：自民國(下同)${start.year}年${p2(start.month)}月${p2(start.day)}日　　時至${end.year}年${p2(end.month)}月${p2(end.day)}日　　時，共計${data.days}日(未滿一日以一日計)。`}
        </Text>

        {/* 第三條 */}
        <View style={s.artRow}><Text style={s.artNum}>第三條</Text><Text style={s.artTitle}>租金</Text></View>
        <Text style={s.para}>雙方約定租金如下：</Text>
        <View style={s.item}><Text style={s.itemNum}>一、</Text><Text style={s.itemBody}>兩折機：租期5日以下，每台租金新臺幣(下同)1萬5,000元。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>三折雙面機：租期5日以下，每台租金1萬8,000元。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>三、</Text><Text style={s.itemBody}>租期超過5日者，依專案報價計收租金。</Text></View>

        {/* 第四條 */}
        <View style={s.artRow}><Text style={s.artNum}>第四條</Text><Text style={s.artTitle}>設備交付</Text></View>
        <View style={s.item}>
          <Text style={s.itemNum}>一、</Text>
          <Text style={s.itemBody}>{`甲方應將第一條所列設備(下稱設備)送至乙方指定地點：${data.delivery_address}。`}</Text>
        </View>
        <View style={s.item}>
          <Text style={s.itemNum}>二、</Text>
          <Text style={s.itemBody}>甲方每台設備均檢附配件盒乙個，內含：天線乙支、電源線兩條(一長一短)、六角扳手乙只，於返回設備時應一併返還。</Text>
        </View>
        <View style={s.item}>
          <Text style={s.itemNum}>三、</Text>
          <Text style={s.itemBody}>甲方提供付費協助設定服務（即派員駐守乙方活動現場，協助即時調整設備設定），由乙方表明：</Text>
        </View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{data.setup_option === "none" ? CHK : UNK}不需要協助設定服務。</Text>
        </View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{data.setup_option === "half" ? CHK : UNK}需要派員{data.setup_option === "half" ? data.setup_persons : "　"}人提供半日協助設定服務，同意收費3,000元/人。</Text>
        </View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{data.setup_option === "full" ? CHK : UNK}需要派員{data.setup_option === "full" ? data.setup_persons : "　"}人提供整日協助設定服務，同意收費4,500元/人。</Text>
        </View>

        <Text style={s.pageNum} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* ===== 第 2 頁 ===== */}
      <Page style={s.page}>
        <View style={s.item}>
          <Text style={s.itemNum}>四、</Text>
          <Text style={s.itemBody}>設備經雙方完成點交後，保管責任即由乙方負擔，租賃期間不論天災或人為因素致生損壞或滅失(包含被竊)，乙方應負無過失責任，賠償甲方損失。</Text>
        </View>

        {/* 第五條 */}
        <View style={s.artRow}><Text style={s.artNum}>第五條</Text><Text style={s.artTitle}>租金給付方式及條件</Text></View>
        <View style={s.item}>
          <Text style={s.itemNum}>一、</Text>
          <Text style={s.itemBody}>乙方應於租期開始前5日，給付相當於全額租金之定金，雙方約定定金於租期開始後得轉換為租金。</Text>
        </View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>匯款資訊：</Text></View>
        <View style={s.subItem}><Text style={s.subNum}>(一)</Text><Text style={s.subBody}>戶名：鉅財王數位科技股份有限公司。</Text></View>
        <View style={s.subItem}><Text style={s.subNum}>(二)</Text><Text style={s.subBody}>銀行代碼：012-7152。</Text></View>
        <View style={s.subItem}><Text style={s.subNum}>(三)</Text><Text style={s.subBody}>銀行：台北富邦銀行　分行：安和分行。</Text></View>
        <View style={s.subItem}><Text style={s.subNum}>(四)</Text><Text style={s.subBody}>帳號：82120000150007。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>三、</Text><Text style={s.itemBody}>發票開立方式：</Text></View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{data.invoice_type === "personal" ? CHK : UNK}二聯式發票(個人)</Text>
        </View>
        <View style={s.chk}>
          <Text style={s.chkLabel}>{data.invoice_type === "company" ? CHK : UNK}三聯式發票(公司)</Text>
        </View>
        {data.invoice_type === "company" && (
          <View style={{ marginLeft: 100 }}>
            <Text>{`公司抬頭：${data.invoice_company || BLANK}`}</Text>
            <Text>{`統一編號：${data.invoice_tax_id || BLANK}`}</Text>
            <Text>{`發票寄送地址：${data.invoice_address || BLANK}`}</Text>
          </View>
        )}

        {/* 第六條 */}
        <View style={s.artRow}><Text style={s.artNum}>第六條</Text><Text style={s.artTitle}>設備使用之限制</Text></View>
        <View style={s.item}><Text style={s.itemNum}>一、</Text><Text style={s.itemBody}>乙方不得對設備進行任何改造。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>乙方不得將設備轉租。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>三、</Text><Text style={s.itemBody}>乙方不得於設備播放侵害他人智慧財產權、商標或違反公序良俗之影音。</Text></View>

        {/* 第七條 */}
        <View style={s.artRow}><Text style={s.artNum}>第七條</Text><Text style={s.artTitle}>設備返還</Text></View>
        <Text style={s.para}>租期屆滿後，乙方應盡善良管理人注意義務確認甲方工程人員身分，於簽署派工單後，妥善收執客戶回聯，將設備交由甲方工程人員拆除返還，始不再負擔保管責任。</Text>
        <Text style={s.para}>返還配件盒內容物應與出租時相同，如有短缺，乙方應返還短缺零件之費用。</Text>

        {/* 第八條 */}
        <View style={s.artRow}><Text style={s.artNum}>第八條</Text><Text style={s.artTitle}>設備毀損或滅失</Text></View>
        <Text style={s.para}>設備發生毀損或遺失時，乙方應立即通知甲方，並依下列方式處理：</Text>
        <View style={s.item}><Text style={s.itemNum}>一、</Text><Text style={s.itemBody}>乙方應負擔修繕期間設備修繕期間之租金及更換零件所產生之修繕費用。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>設備毀損無法修繕或遺失時，乙方應賠償甲方官方定價之設備售價金額。</Text></View>

        <Text style={s.pageNum} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* ===== 第 3 頁 ===== */}
      <Page style={s.page}>
        {/* 第九條 */}
        <View style={s.artRow}><Text style={s.artNum}>第九條</Text><Text style={s.artTitle}>違約金</Text></View>
        <View style={s.item}><Text style={s.itemNum}>一、</Text><Text style={s.itemBody}>若設備遭乙方惡意毀損，除前條約定損害賠償外，並須給付相當於該設備甲方官方定價之懲罰性違約金。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>租期屆滿後，乙方拒不返還設備者，除應返還相當於租金之不當得利外，並須給付相當於該設備甲方官方定價之懲罰性違約金。</Text></View>

        {/* 第一〇條 */}
        <View style={s.artRow}><Text style={s.artNum}>第一〇條</Text><Text style={s.artTitle}>其他約定事項</Text></View>
        <View style={s.item}><Text style={s.itemNum}>一、</Text><Text style={s.itemBody}>本契約之附件、專案廣告內容，均屬契約之一部，有同一之效力。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>二、</Text><Text style={s.itemBody}>本契約所載金額均為未稅金額。</Text></View>
        <View style={s.item}><Text style={s.itemNum}>三、</Text><Text style={s.itemBody}>甲方人員自行承諾本契約以外事項視同無效，且乙方不得向甲方人員行賄、利誘，如有違反，甲方除可追究各方相關法律責任，追討全數不法所得外，並得向該人員及乙方要求共同加罰前述數額10倍懲罰性違約金。</Text></View>

        {/* 第一一條 */}
        <View style={s.artRow}><Text style={s.artNum}>第一一條</Text><Text style={s.artTitle}>合意管轄</Text></View>
        <Text style={s.para}>因本契約涉訟，雙方合意以臺灣新北地方法院為第一審管轄法院。</Text>

        {/* 簽署區 */}
        <Text style={[s.sigLabel, { marginTop: 20 }]}>立契約書人</Text>
        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigBoxTitle}>甲方</Text>
            <Text>姓　　名：鉅財王數位科技股份有限公司（代表人：呂淑君）</Text>
            <Text>統一編號：94213667</Text>
            <Text>地　　址：新北市新莊區新北大道2段219號8樓</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigBoxTitle}>乙方</Text>
            {data.company ? (
              <>
                <Text>{`姓　　名：${data.company}`}</Text>
                <Text>{`代　表　人：${data.name}`}</Text>
                <Text>{`統一編號：${data.id_number}`}</Text>
              </>
            ) : (
              <>
                <Text>{`姓　　名：${data.name}`}</Text>
                <Text>{`身分證字號：${data.id_number}`}</Text>
              </>
            )}
            <Text>{`地　　址：${data.customer_address}`}</Text>
          </View>
        </View>

        <View style={[s.dateRow, { marginTop: 24 }]}>
          <Text>中　華　民　國</Text>
          <Text>{`${today.year}`}</Text>
          <Text>年</Text>
          <Text>{`${p2(today.month)}`}</Text>
          <Text>月</Text>
          <Text>{`${p2(today.day)}`}</Text>
          <Text>日</Text>
        </View>

        <Text style={s.pageNum} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  );
}
