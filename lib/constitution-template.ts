export type ConstitutionSections = {
  purpose: string;
  contributionAgreement: string;
  meetingRules: string;
  loanRules: string;
  shareOutMethod: string;
  disputes: string;
};

/** A starting-point template in Kinyarwanda — leaders customize it before publishing. */
export const DEFAULT_CONSTITUTION_TEMPLATE: ConstitutionSections = {
  purpose:
    "Iki kimina cyashinzwe kugira ngo abanyamuryango bafatanye kwizigama no kugurizanya, bongere ubushobozi bwabo bw'ubukungu binyuze mu bufatanye.",
  contributionAgreement:
    "Buri munyamuryango yiyemeza gutanga umusanzu ungana ku nama zose z'ikimina. Umusanzu utangwa ku itariki y'inama kandi ntushobora gutindira nta mpamvu yemewe.",
  meetingRules:
    "Inama zibera ku munsi wagenwe n'itsinda, ku gihe cyumvikanyweho. Abanyamuryango bagomba kuzitabira bose. Ihagarara ry'inama risaba ko byibura kimwe cya kabiri cy'abanyamuryango bahari.",
  loanRules:
    "Umunyamuryango ashobora gusaba inguzanyo ingana n'inshuro zumvikanyweho z'umusanzu we. Inguzanyo zishyurwa n'inyungu yumvikanyweho, mu gihe cyagenwe. Umukuru w'itsinda cyangwa itsinda ryose bemeza buri cyifuzo.",
  shareOutMethod:
    "Ku mpera y'umuzenguruko, amafaranga yose (imisanzu n'inyungu) agabanywa mu banyamuryango ukurikije uko buri wese yagize uruhare mu misanzu, hakuwemo inguzanyo zitarishyuwe.",
  disputes:
    "Impaka zose zikemurwa mu nama rusange y'itsinda. Iyo bidashobotse, itsinda rishobora gusaba ubufasha bw'umuyobozi w'akagari cyangwa undi muntu wizerwa n'abanyamuryango bose.",
};
