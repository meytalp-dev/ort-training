import SlideLayout from "../SlideLayout";

const SlideCommunity = () => (
  <SlideLayout>
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="slide-title">הצטרפו לקהילת המורים</h2>
        <p className="slide-body mt-4">
          סרקו את הקוד והצטרפו לקבוצת הווטסאפ שלנו כדי לקבל עדכונים, לשתף
          רעיונות ולקבל תמיכה מעמיתים.
        </p>
        <p className="mt-4 font-medium text-foreground text-lg">
          נשמח לראות אתכם שם!
        </p>
      </div>
      <div className="slide-card-medium aspect-square max-w-xs mx-auto flex flex-col items-center justify-center">
        <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-2xl">
          <p className="text-muted-foreground text-sm">[מקום לקוד QR]</p>
        </div>
        <p className="mt-4 text-center font-medium text-foreground">
          קהילת lovable למורים
        </p>
      </div>
    </div>
  </SlideLayout>
);

export default SlideCommunity;
