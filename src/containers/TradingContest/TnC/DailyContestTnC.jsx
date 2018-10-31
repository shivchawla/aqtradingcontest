import * as React from 'react';
import Media from 'react-media';
import {primaryColor} from '../../../constants';
import AqLayout from '../../../components/ui/AqLayout';

export default class DailyContestTnC extends React.Component {
    
    renderPageContent() {
        return (
            <div style={{padding: '20px 40px', fontSize: '16px', textAlign: 'start'}}>
                
                <h1 style={{marginBottom: '40px', fontWeight: 400}}>Stock Prediction Contest Rules</h1>
                <h3 style={h3Style}>Overview</h3>
                <p>The Stock Prediction Contest at AdviceQube is a daily competition that awards the best stock pickers. The contest is based on Indian markets and designed to evaluate expert's ability to pick profitable trades/stocks using subset of trade-able equities on National Stock Exchange, India. Each day, the top 5 participants are awarded cash prizes worth Rs. 500 every day.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Eligibility</h3>
                <p style={bulletStyle}>1. To be eligible to take part in the Contest, Participants must have a registered AdviceQube account. If a Participant doesn&rsquo;t have an account yet, the Participant can sign up <a href="https://www.adviceqube.com/signup">here</a>.</p>
                <p style={bulletStyle}>2. Participants must be at least 18 years old or older at the time of entry. Age may be verified prior to prize distribution.</p>
                <p style={bulletStyle}>3. Participants must be a citizen of India.</p>
                <p style={bulletStyle}>4. There is no fee for entry and no purchase is necessary.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Criteria</h3>
                <p>In order to be eligible for participation in the Contest, predictions are required to meet a particular set of requirements. All predictions are checked for applicable requirements before submission. These are the requirements that are required of all entries/predictions:</p>
                <p><br /><strong>NIFTY_500 Stocks only</strong>: Contest entries can choose stocks only from a broad universe of NIFTY_500 stocks when <em>Buying</em>. <em>However, only stocks with available future contract are open for selling.</em></p>
                <p><strong>Max. of 10 Predictions: </strong>Participants can submit a maximum of 10 predictions on a daily basis.&nbsp; Each prediction must contain a prediction horizon, trade direction and investment amount. Investment amount can only be in multiples of 10K.&nbsp;</p>
                <p><strong>Max. of 3 Predictions per Stock: </strong>Participants can submit a maximum of 3 predictions for a single stock.&nbsp;</p>
                <p><strong>Max. of 1 Predictions per Stock/Horizon combination: </strong>Participants can submit only ONE prediction for a stock and horizon combination. For ex: Buy TCS for 3 days with profit target of 3%. In this case case, another 3 day prediction for TCS is not allowed.&nbsp;&nbsp;</p>
                <p><strong>Positive PnL</strong>: Only net profitable predictions are considered for evaluation and any award. For ex: If all predictions (maturing on a date) sum to a net loss, it is not eligible for any awards and prizes.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Submission</h3>
                <p style={bulletStyle}>1. Predictions must be submitted between Market Open (9:30 AM) and Market Close (3:30PM). All predictions maturing on that day are evaluated and are considered for PnL calculation. Results are declared after market close.</p>
                <p style={bulletStyle}>2. Predictions are not carried forward (after the chosen horizon) so participants must update their predictions often to maximize their chances of prize. Only predictions maturing on a particular date are considered for contest prizes.</p>
                <p style={bulletStyle}>3. Each Participant can submit only 1 entry to the contest. Participant can submit up-to 10 predictions each day.</p>
                <p style={bulletStyle}>4. Participant's entry must not violate or infringe on any applicable law or regulation or third-party rights.</p>
                <p style={bulletStyle}>5. Participant's intellectual property will remain Participant's property; However, we may look at Participant's Investment Portfolio for additional checks. We WILL NOT use/distribute participant&rsquo;s stock predictions without explicit consent.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Scoring </h3>
                <p><strong>As the contest is designed to award stock pickers that generate profits, our scoring function will depend mainly on Profit generated over the prediction horizon</strong></p>
                <p>At the end of each trading day, all prediction maturing on that date are considered and participant's&nbsp; profit/loss is calculated. The top 5 participants will be displayed on the <a href="https://www.adviceqube.com/contest/leaderboard">leaderboard</a> every day.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Other Rules</h3>
                <p style={bulletStyle}>1. Each Participant may have only one AdviceQube account. If the Participant submits entries from more than one account, all entries may be disqualified.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Reward</h3>
                <p>At the end of each trading day, the top 5 ranked participants will win cash prizes of Rs. 100</p>
                <p>AdviceQube will email winners at the end of each trading day. Prizes will be disbursed on a weekly basis at the end of the week.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>General Conditions</h3>
                <p style={bulletStyle}>1. Prizes are non-transferable to other AdviceQube members or to other accounts.</p>
                <p style={bulletStyle}>2. AdviceQube reserves the right at its sole discretion to alter, amend, modify, suspend or terminate this Contest, or any aspect of it, including but not limited to changing the prize frequency, prize amount, requirements, scoring rules, at any time and without prior notice. In such event AdviceQube will make reasonable efforts to notify all Participants by email.</p>
                <p style={bulletStyle}>3. AdviceQube will make all reasonable efforts to support the acceptance of entries. Entries may not be successfully processed because of errors or failures. Those errors or failures may be caused by AdviceQube, the Participant, third parties, or a combination of parties. AdviceQube will not be liable or otherwise responsible for any entry that cannot be processed, regardless of the cause of the problem.</p>
                <p style={bulletStyle}>4. AdviceQube will have complete discretion over interpretation of the Contest Rules, administration of the Contest and selection of the Winners. Decisions of AdviceQube as to the administration of the Contest, interpretation of the Contest Rules and the selection of the Winners will be binding and final.</p>
                <p style={bulletStyle}>5. Participant agrees and gives his/her express consent for AdviceQube to use or publish without additional compensation in any medium (including, without limitation, in print, via television, via the internet, via email and or/other electronic form) and/or share with its agents, business partners and successors during and after the Contest, information for publicity purposes including photographs, videotape or digital recordings that AdviceQube &nbsp;takes of Participant, Participant's AdviceQube profile, public written statements, and Investment Idea performance for all or part of the Contest, without compensation. Participant hereby waives any rights, claims or interests that Participant may have to control the use of any or all of the publicity material in whatever medium used.</p>
                <p style={bulletStyle}>6. All current employees, interns, and contractors of AdviceQube; and their immediate family members; and their household members are prohibited from participating in the Contest.</p>
                <p style={bulletStyle}>7. This Contest is void where prohibited by law.</p>
                <p style={bulletStyle}>8. If any provision(s) of these Contest Rules is held to be invalid or unenforceable, all remaining provisions hereof will remain in full force and effect.</p>
                <p style={bulletStyle}>9. Contest Winners are solely responsible for the payment of any and all applicable taxes that may apply on their prize. AdviceQube shall have the right, but not the obligation, to make any deductions and withholdings that AdviceQube deems necessary or desirable under applicable tax laws, rules, regulations, codes or ordinances.</p>
                <p style={bulletStyle}>10. AdviceQube is not responsible for the actions of Participants in connection with the Contest, including Participants&rsquo; attempts to circumvent the Contest Rules or otherwise interfere with the administration, security, fairness, integrity or proper conduct of the Contest. Persons found tampering with or abusing any aspect of this Contest, or who AdviceQube believes to be causing or attempting to cause malfunction, error, disruption or damage will be disqualified. Additionally, any attempt to cheat the Contest, as determined at the sole discretion of AdvicQube, may result in immediate disqualification of the Participant, as well as other possible consequences, including temporary or permanent disqualification from the Contest. AdviceQube reserves the right, at its sole and absolute discretion, to disqualify any individual who is found to be, or suspected of, acting in violation of these Contest Rules, or to be acting in an un-sportsmanlike, obscene, immoral or disruptive manner, or with the intent to annoy, abuse, threaten or harass any other person.</p>
                <p style={bulletStyle}>11. These Contest Rules shall be governed by and subject to the AdviceQube <a href="https://www.adviceqube.com/policies/tnc">Terms of Use</a> including the jurisdictional and dispute processes specified therein.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Binding Agreement</h3>
                <p>Participant agrees that by participating in the Contest that Participant will be bound by these Contest Rules (which may be amended or varied at any time by AdviceQube with or without notice) as well as the <a href="https://www.adviceqube.com/policies/tnc">terms and conditions</a> that apply to Participant's use of the AdviceQube &nbsp;website.</p>
                <p>&nbsp;</p>
                <h3 style={h3Style}>Liability</h3>
                <p style={bulletStyle}>1. To the maximum extent permitted by law, Participant agrees to release, discharge and hold harmless AdviceQube and each of its parents, subsidiaries, affiliates, prize providers/suppliers, agents, representatives, retailers, and advertising and promotion agencies, and each of their respective directors, officers, employees, agents, successors and assigns (collectively, the "Released Parties"), from any and all liability, claims, losses, injuries, demands, damages, actions, and/or causes of actions whether direct or indirect, which may be due to or arise out of or in connection with the participation in the Contest or any portion thereof, or the awarding, acceptance, receipt, use or misuse or possession of the prizes or while preparing for or participating in any Contest-related activity (including, without limitation, liability for any property loss, damage, personal injury or death, violation of rights of publicity or privacy, or claims of defamation or portrayal in a false light; or based on any claim of infringement of intellectual property). Participants agree that the Released Parties shall have no responsibility or liability for discontinued prizes; human error; incorrect or inaccurate transcription of information; any technical malfunctions of the telephone network, computer equipment or systems, software, or Internet service provider utilized by AdviceQube; interruption or inability to access the Contest website or any online service via the Internet due to hardware or software compatibility problems; any damage to participant&rsquo;s (or any third person&rsquo;s) computer and/or its contents related to or resulting from any part of the Contest; any lost/delayed data transmissions, omissions, interruptions, defects; and/or any other errors or malfunctions, even if caused by the negligence of the Released Parties. Each participant further agrees to indemnify and hold harmless Released Parties from and against any and all liability resulting or arising from the Contest and to release all rights to bring any claim, action or proceeding against Released Parties and hereby acknowledges that Released Parties have neither made nor are in any manner responsible or liable for any warranty, representation or guarantee, express or implied, in fact or in law, relative to a prize, including express warranties provided exclusively by a prize supplier that may be sent along with a prize. The releases hereunder are intended to apply to all claims not known or suspected to exist with the intent of waiving the effect of laws requiring the intent to release future unknown claims.</p>
                <p style={bulletStyle}>2. PARTICIPANT AGREES THAT: (1) ANY AND ALL DISPUTES, CLAIMS AND CAUSES OF ACTION ARISING OUT OF OR CONNECTED WITH THE CONTEST, OR ANY PRIZE AWARDED, WILL BE RESOLVED INDIVIDUALLY, WITHOUT RESORT TO ANY FORM OF COLLECTIVE LEGAL ACTION; (2) ANY AND ALL CLAIMS, JUDGMENTS AND AWARDS WILL BE LIMITED TO ACTUAL THIRD-PARTY, OUT-OF-POCKET COSTS INCURRED, (IF ANY), NOT TO EXCEED TEN THOUSAND RUPEES(₨ 10,000.00), BUT IN NO EVENT WILL ATTORNEYS&rsquo; FEES BE AWARDED OR RECOVERABLE; (3) UNDER NO CIRCUMSTANCES WILL ANY PARTICIPANT BE PERMITTED TO OBTAIN ANY AWARD FOR, AND PARTICIPANT HEREBY KNOWINGLY AND EXPRESSLY WAIVES ALL RIGHTS TO SEEK, PUNITIVE, INCIDENTAL, CONSEQUENTIAL OR SPECIAL DAMAGES, LOST PROFITS AND/OR ANY OTHER DAMAGES, OTHER THAN ACTUAL OUT-OF-POCKET EXPENSES NOT TO EXCEED TEN THOUSAND RUPEES (₨ 10,000.00), AND/OR ANY RIGHTS TO HAVE DAMAGES MULTIPLIED OR OTHERWISE INCREASED; AND (4) PARTICIPANT&rsquo;S REMEDIES ARE LIMITED TO A CLAIM FOR MONEY DAMAGES (IF ANY) AND PARTICIPANT IRREVOCABLY WAIVES ANY RIGHT TO SEEK INJUNCTIVE OR EQUITABLE RELIEF. SOME JURISDICTIONS DO NOT ALLOW THE LIMITATIONS OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE MAY NOT APPLY TO THE PARTICIPANT.</p>
                <p>&nbsp;</p>
                <p>Last revised: 04th November 2018</p>
                <p><br /><br /></p>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 599px)"
                    render={() => {
                        return (
                            <AqLayout>
                                {this.renderPageContent()}
                            </AqLayout>
                        );
                    }}
                />
                <Media 
                    query="(min-width: 600px)"
                    render={() => {
                        return this.renderPageContent();
                    }}
                />
            </React.Fragment>
        );
    }
}

const h3Style = {
    fontSize: '18px',
    color: primaryColor,
    fontWeight: 400
};

const bulletStyle = {
    marginBottom: '8px',
    lineHeight: '20px',
};