import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "NotoSansTC",
  src: path.join(process.cwd(), "public", "fonts", "NotoSansTC-Regular.woff"),
});

export interface ContractData {
  name: string;
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
    fontSize: 9,
    paddingTop: 45,
    paddingBottom: 45,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.7,
    color: "#111",
  },
  title: { fontSize: 15, textAlign: "center", marginBottom: 10 },
  intro: { marginBottom: 8 },
  secTitle: { fontSize: 10, marginTop: 10, marginBottom: 3, textDecoration: "underline" },
  para: { marginBottom: 4 },
  indent: { marginLeft: 14, marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  box: { width: "47%", border: "1 solid #999", padding: 8 },
  boxTitle: { fontSize: 10, marginBottom: 4 },
  center: { textAlign: "center" },
  note: { fontSize: 7.5, color: "#666", marginTop: 4 },
});

const CHK = "■";
const UNK = "□";

export function ContractPDF({ data }: { data: ContractData }) {
  const start = toROCDate(data.start_date);
  const end = toROCDate(data.end_date);
  const today = toROCDate(data.contract_date);
  const isSingle = data.product_type === "single";
  const isTriple = data.product_type === "triple";

  return (
    <Document>
      <Page style={s.page}>
        <Text style={s.title}>設備租賃契約</Text>

        <Text style={s.intro}>
          {"　　緣甲方同意以設備租與乙方使用收益，乙方同意支付租金，遂雙方合意簽訂本契約，約定事項如下："}
        </Text>

        {/* 一 */}
        <Text style={s.secTitle}>一、租賃標的物與數量</Text>
        <Text style={s.para}>甲方同意將下列設備租與乙方使用收益：</Text>
        <Text style={s.indent}>
          {isSingle ? CHK : UNK}
          {` 兩折機，${isSingle ? data.quantity : "　　　"}台。`}
        </Text>
        <Text style={s.indent}>
          {isTriple ? CHK : UNK}
          {` 三折雙面機，${isTriple ? data.quantity : "　　　"}台。`}
        </Text>

        {/* 二 */}
        <Text style={s.secTitle}>二、租期</Text>
        <Text style={s.para}>
          {`承租期間：自民國(下同)${start.year}年${p2(start.month)}月${p2(start.day)}日　　時至${end.year}年${p2(end.month)}月${p2(end.day)}日　　時，共計${data.days}日(未滿一日以一日計)。`}
        </Text>

        {/* 三 */}
        <Text style={s.secTitle}>三、租金</Text>
        <Text style={s.para}>雙方約定租金如下：</Text>
        <Text style={s.indent}>兩折機：租期5日以下，每台租金新臺幣(下同)1萬5,000元。</Text>
        <Text style={s.indent}>三折雙面機：租期5日以下，每台租金1萬8,000元。</Text>
        <Text style={s.indent}>租期超過5日者，依專案報價計收租金。</Text>

        {/* 四 */}
        <Text style={s.secTitle}>四、設備交付</Text>
        <Text style={s.para}>{`甲方應將第一條所列設備(下稱設備)送至乙方指定地點：${data.delivery_address}。`}</Text>
        <Text style={s.para}>
          {"甲方每台設備均檢附配件盒乙個，內含：天線乙支、電源線兩條(一長一短)、六角扳手乙只，於返回設備時應一併返還。"}
        </Text>
        <Text style={s.para}>
          {"甲方提供付費協助設定服務（即派員駐守乙方活動現場，協助即時調整設備設定），由乙方表明："}
        </Text>
        <Text style={s.indent}>{data.setup_option === "none" ? CHK : UNK} 不需要協助設定服務。</Text>
        <Text style={s.indent}>
          {data.setup_option === "half" ? CHK : UNK}
          {` 需要派員${data.setup_option === "half" ? data.setup_persons : "　"}人提供半日協助設定服務，同意收費3,000元/人。`}
        </Text>
        <Text style={s.indent}>
          {data.setup_option === "full" ? CHK : UNK}
          {` 需要派員${data.setup_option === "full" ? data.setup_persons : "　"}人提供整日協助設定服務，同意收費4,500元/人。`}
        </Text>
        <Text style={s.para}>
          {"設備經雙方完成點交後，保管責任即由乙方負擔，租賃期間不論天災或人為因素致生損壞或滅失(包含被竊)，乙方應負無過失責任，賠償甲方損失。"}
        </Text>

        {/* 五 */}
        <Text style={s.secTitle}>五、租金給付方式及條件</Text>
        <Text style={s.para}>乙方應於租期開始前5日，給付相當於全額租金之定金，雙方約定定金於租期開始後得轉換為租金。</Text>
        <Text style={s.para}>匯款資訊：</Text>
        <Text style={s.indent}>戶名：鉅財王數位科技股份有限公司。</Text>
        <Text style={s.indent}>銀行代碼：012-7152。</Text>
        <Text style={s.indent}>銀行：台北富邦銀行　分行：安和分行。</Text>
        <Text style={s.indent}>帳號：82120000150007。</Text>
        <Text style={s.para}>發票開立方式：</Text>
        <Text style={s.indent}>{data.invoice_type === "personal" ? CHK : UNK} 二聯式發票(個人)</Text>
        <Text style={s.indent}>{data.invoice_type === "company" ? CHK : UNK} 三聯式發票(公司)</Text>
        {data.invoice_type === "company" && (
          <View style={s.indent}>
            <Text>{`　　公司抬頭：${data.invoice_company || ""}`}</Text>
            <Text>{`　　統一編號：${data.invoice_tax_id || ""}`}</Text>
            <Text>{`　　發票寄送地址：${data.invoice_address || ""}`}</Text>
          </View>
        )}

        {/* 六 */}
        <Text style={s.secTitle}>六、設備使用之限制</Text>
        <Text style={s.indent}>乙方不得對設備進行任何改造。</Text>
        <Text style={s.indent}>乙方不得將設備轉租。</Text>
        <Text style={s.indent}>乙方不得於設備播放侵害他人智慧財產權、商標或違反公序良俗之影音。</Text>

        {/* 七 */}
        <Text style={s.secTitle}>七、設備返還</Text>
        <Text style={s.para}>
          {"租期屆滿後，乙方應盡善良管理人注意義務確認甲方工程人員身分，於簽署派工單後，妥善收執客戶回聯，將設備交由甲方工程人員拆除返還，始不再負擔保管責任。"}
        </Text>
        <Text style={s.para}>返還配件盒內容物應與出租時相同，如有短缺，乙方應返還短缺零件之費用。</Text>

        {/* 八 */}
        <Text style={s.secTitle}>八、設備毀損或滅失</Text>
        <Text style={s.para}>設備發生毀損或遺失時，乙方應立即通知甲方，並依下列方式處理：</Text>
        <Text style={s.indent}>乙方應負擔修繕期間設備修繕期間之租金及更換零件所產生之修繕費用。</Text>
        <Text style={s.indent}>設備毀損無法修繕或遺失時，乙方應賠償甲方官方定價之設備售價金額。</Text>

        {/* 九 */}
        <Text style={s.secTitle}>九、違約金</Text>
        <Text style={s.para}>若設備遭乙方惡意毀損，除前條約定損害賠償外，並須給付相當於該設備甲方官方定價之懲罰性違約金。</Text>
        <Text style={s.para}>
          {"租期屆滿後，乙方拒不返還設備者，除應返還相當於租金之不當得利外，並須給付相當於該設備甲方官方定價之懲罰性違約金。"}
        </Text>

        {/* 十 */}
        <Text style={s.secTitle}>十、其他約定事項</Text>
        <Text style={s.indent}>本契約之附件、專案廣告內容，均屬契約之一部，有同一之效力。</Text>
        <Text style={s.indent}>本契約所載金額均為未稅金額。</Text>
        <Text style={s.indent}>
          {"甲方人員自行承諾本契約以外事項視同無效，且乙方不得向甲方人員行賄、利誘，如有違反，甲方除可追究各方相關法律責任，追討全數不法所得外，並得向該人員及乙方要求共同加罰前述數額10倍懲罰性違約金。"}
        </Text>

        {/* 十一 */}
        <Text style={s.secTitle}>十一、合意管轄</Text>
        <Text style={s.para}>因本契約涉訟，雙方合意以臺灣新北地方法院為第一審管轄法院。</Text>

        {/* 簽署 */}
        <Text style={[s.secTitle, { marginTop: 14 }]}>立契約書人</Text>
        <View style={s.row}>
          <View style={s.box}>
            <Text style={s.boxTitle}>甲方</Text>
            <Text>姓名：盛源精密工業股份有限公司</Text>
            <Text>　　　（代表人：王復華）</Text>
            <Text>統一編號：54034739</Text>
            <Text>地址：新北市新莊區新北大道2段219號8樓</Text>
          </View>
          <View style={s.box}>
            <Text style={s.boxTitle}>乙方</Text>
            <Text>{`姓名：${data.name}`}</Text>
            <Text>{`身分證字號：${data.id_number}`}</Text>
            <Text>{`地址：${data.customer_address}`}</Text>
          </View>
        </View>

        <Text style={[s.center, { marginTop: 14 }]}>
          {`中華民國${today.year}年${p2(today.month)}月${p2(today.day)}日`}
        </Text>

        <Text style={s.note}>
          此契約依乙方提交之預約資料由系統自動產生，版本以甲方 Email 寄送之檔案為準。
        </Text>
      </Page>
    </Document>
  );
}
