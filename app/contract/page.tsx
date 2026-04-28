export default function ContractPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-gray-900">
      <h1 className="text-3xl font-bold text-center mb-2 tracking-widest">設備租賃契約</h1>
      <p className="text-center text-sm text-gray-400 mb-10">本頁為契約條款預覽，實際契約將依您填寫之資料自動產生並寄送至您的信箱。</p>

      {/* 立契約書人 */}
      <div className="border-l-4 border-gray-300 pl-4 mb-8 space-y-1 text-sm">
        <div className="flex gap-4">
          <span className="text-gray-500 shrink-0">立契約書人</span>
          <div>
            <p>鉅財王數位科技股份有限公司　　（下稱甲方）</p>
            <p>承租方（下稱乙方）</p>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-8 indent-8">
        緣甲方同意以設備租與乙方使用收益，乙方同意支付租金，遂雙方合意簽訂本契約，約定事項如下：
      </p>

      <div className="space-y-6 text-sm leading-relaxed">

        {/* 第一條 */}
        <section>
          <h2 className="font-bold mb-2">第一條　租賃標的物與數量</h2>
          <p className="ml-6">甲方同意將下列設備租與乙方使用收益：</p>
          <ul className="ml-10 mt-1 space-y-1">
            <li>□　兩折機（單折LED廣告機）</li>
            <li>□　三折雙面機（三折LED廣告機）</li>
          </ul>
          <p className="ml-6 mt-1">數量依預約表單填寫為準。</p>
        </section>

        {/* 第二條 */}
        <section>
          <h2 className="font-bold mb-2">第二條　租期</h2>
          <p className="ml-6">承租期間依預約表單填寫之租借起訖日為準，未滿一日以一日計。</p>
        </section>

        {/* 第三條 */}
        <section>
          <h2 className="font-bold mb-2">第三條　租金</h2>
          <p className="ml-6 mb-1">雙方約定租金如下：</p>
          <ol className="ml-10 space-y-1 list-none">
            <li>一、兩折機：租期5日以下，每台租金新臺幣（下同）1萬5,000元。</li>
            <li>二、三折雙面機：租期5日以下，每台租金1萬8,000元。</li>
            <li>三、租期超過5日者，依專案報價計收租金。</li>
          </ol>
        </section>

        {/* 第四條 */}
        <section>
          <h2 className="font-bold mb-2">第四條　設備交付</h2>
          <ol className="ml-6 space-y-2 list-none">
            <li>一、甲方應將第一條所列設備（下稱設備）送至乙方指定地點。</li>
            <li>二、甲方每台設備均檢附配件盒乙個，內含：天線乙支、電源線兩條（一長一短）、六角扳手乙只，於返回設備時應一併返還。</li>
            <li>三、甲方提供付費協助設定服務（即派員駐守乙方活動現場，協助即時調整設備設定），由乙方表明：
              <ul className="ml-4 mt-1 space-y-1">
                <li>□　不需要協助設定服務。</li>
                <li>□　需要派員提供半日協助設定服務，同意收費3,000元/人。</li>
                <li>□　需要派員提供整日協助設定服務，同意收費4,500元/人。</li>
              </ul>
            </li>
            <li>四、設備經雙方完成點交後，保管責任即由乙方負擔，租賃期間不論天災或人為因素致生損壞或滅失（包含被竊），乙方應負無過失責任，賠償甲方損失。</li>
          </ol>
        </section>

        {/* 第五條 */}
        <section>
          <h2 className="font-bold mb-2">第五條　租金給付方式及條件</h2>
          <ol className="ml-6 space-y-2 list-none">
            <li>一、乙方應於租期開始前5日，給付相當於全額租金之定金，雙方約定定金於租期開始後得轉換為租金。</li>
            <li>二、匯款資訊：預約確認後，詳細匯款帳號將隨契約書一併寄至您的電子信箱。</li>
            <li>三、發票開立方式依預約表單填寫之發票資訊為準（二聯式/三聯式）。</li>
          </ol>
        </section>

        {/* 第六條 */}
        <section>
          <h2 className="font-bold mb-2">第六條　設備使用之限制</h2>
          <ol className="ml-6 space-y-1 list-none">
            <li>一、乙方不得對設備進行任何改造。</li>
            <li>二、乙方不得將設備轉租。</li>
            <li>三、乙方不得於設備播放侵害他人智慧財產權、商標或違反公序良俗之影音。</li>
          </ol>
        </section>

        {/* 第七條 */}
        <section>
          <h2 className="font-bold mb-2">第七條　設備返還</h2>
          <p className="ml-6">租期屆滿後，乙方應盡善良管理人注意義務確認甲方工程人員身分，於簽署派工單後，妥善收執客戶回聯，將設備交由甲方工程人員拆除返還，始不再負擔保管責任。</p>
          <p className="ml-6 mt-2">返還配件盒內容物應與出租時相同，如有短缺，乙方應返還短缺零件之費用。</p>
        </section>

        {/* 第八條 */}
        <section>
          <h2 className="font-bold mb-2">第八條　設備毀損或滅失</h2>
          <p className="ml-6 mb-1">設備發生毀損或遺失時，乙方應立即通知甲方，並依下列方式處理：</p>
          <ol className="ml-10 space-y-1 list-none">
            <li>一、乙方應負擔修繕期間設備修繕期間之租金及更換零件所產生之修繕費用。</li>
            <li>二、設備毀損無法修繕或遺失時，乙方應賠償甲方官方定價之設備售價金額。</li>
          </ol>
        </section>

        {/* 第九條 */}
        <section>
          <h2 className="font-bold mb-2">第九條　違約金</h2>
          <ol className="ml-6 space-y-1 list-none">
            <li>一、若設備遭乙方惡意毀損，除前條約定損害賠償外，並須給付相當於該設備甲方官方定價之懲罰性違約金。</li>
            <li>二、租期屆滿後，乙方拒不返還設備者，除應返還相當於租金之不當得利外，並須給付相當於該設備甲方官方定價之懲罰性違約金。</li>
          </ol>
        </section>

        {/* 第一〇條 */}
        <section>
          <h2 className="font-bold mb-2">第一〇條　其他約定事項</h2>
          <ol className="ml-6 space-y-1 list-none">
            <li>一、本契約之附件、專案廣告內容，均屬契約之一部，有同一之效力。</li>
            <li>二、本契約所載金額均為未稅金額。</li>
            <li>三、甲方人員自行承諾本契約以外事項視同無效，且乙方不得向甲方人員行賄、利誘，如有違反，甲方除可追究各方相關法律責任，追討全數不法所得外，並得向該人員及乙方要求共同加罰前述數額10倍懲罰性違約金。</li>
          </ol>
        </section>

        {/* 第一一條 */}
        <section>
          <h2 className="font-bold mb-2">第一一條　合意管轄</h2>
          <p className="ml-6">因本契約涉訟，雙方合意以臺灣新北地方法院為第一審管轄法院。</p>
        </section>

      </div>

      {/* 說明 */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-2">關於契約簽署</p>
          <p>預約送出並確認後，系統將自動產生填入您資料的完整契約書（含甲乙雙方資訊、匯款帳號），以 PDF 附件寄送至您填寫的電子信箱。</p>
        </div>
      </div>
    </div>
  );
}
