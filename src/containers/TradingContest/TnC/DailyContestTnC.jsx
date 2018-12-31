import * as React from 'react';
import Media from 'react-media';
import Grid from '@material-ui/core/Grid';
import {primaryColor} from '../../../constants';
import AqLayout from '../../../components/ui/AqLayout';
import Footer from '../../Footer';
import Header from '../../Header';

export default class DailyContestTnC extends React.Component {
    
    renderPageContent() {
        return (
            <Grid container>
                <Media 
                    query="(min-width: 600px)"
                    render={() => {
                        return (
                            <Grid item xs={12}>
                                <Header activeIndex={9} />
                            </Grid>
                        );
                    }}
                />
                <Grid item xs={12}>
                    <div style={{padding: '20px 40px', fontSize: '16px', textAlign: 'start'}}>
                        
                        <h1 style={{marginBottom: '40px', fontWeight: 400}}>Stock Prediction Contest Rules</h1>
                        <h3 style={h3Style}>Overview</h3>
                        <p>The Virtual Trading Contest at AdviceQube is a competition that awards the best stock pickers. The contest is based on Indian markets and designed to evaluate expert's ability to pick profitable trades/stocks using subset of trade-able equities on National Stock Exchange, India. The particpants can win prizes daily, weekly and monthly based on criteria.</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Eligibility</h3>
                        <p style={bulletStyle}>1. To be eligible to take part in the Contest, Participants must have a registered AdviceQube account. If a Participant doesn&rsquo;t have an account yet, the Participant can sign up <a href="https://www.adviceqube.com/signup">here</a>.</p>
                        <p style={bulletStyle}>2. Participants must be at least 18 years old or older at the time of entry. Age may be verified prior to prize distribution.</p>
                        <p style={bulletStyle}>3. Participants must be a citizen of India.</p>
                        <p style={bulletStyle}>4. There is no fee for entry and no purchase is necessary.</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Criteria</h3>
                        <p>In order to be eligible for participation in the Contest, predictions are required to meet a particular set of requirements. All predictions are checked for applicable requirements before submission. These are the requirements that are required of all entries/predictions:</p>
                        <p><br /><strong>NIFTY_500 Stocks only</strong>: Contest entries can choose stocks only from a broad universe of NIFTY_500 stocks when <em>Buying</em>.</p>
                        <p><strong>Max. of 3 Predictions per Stock: </strong>Participants can submit a maximum of 3 predictions for a single stock.&nbsp;</p>
                        <p><strong>Max. of 1 Predictions per Stock/Horizon combination: </strong>Participants can submit only ONE prediction for a stock and horizon combination. For ex: Buy TCS for 3 days with profit target of 3%. In this case case, another 3 day prediction for TCS is not allowed.&nbsp;&nbsp;</p>
                        <p><strong>Prediction Requirements: </strong>Each prediction must contain a prediction horizon, trade direction, investment amount and stoploss. Investment amount can only be a subset of 10K, 25K, 50K, 75K or 1Lac. 
                        <p><strong>Virual Cash of 10 Lacs: </strong>Each participant is a given a virtual cash of 10Lacs at the beginning of the contest. Once all cash is invested, particpants must liquidate a trade OR wait for prediction maturity to create new predictions.</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Submission</h3>
                        <p style={bulletStyle}>1. Predictions can be submitted anytime. All predictions active on a day are evaluated and are considered for PnL calculation. Results are declared after market close.</p>
                        <p style={bulletStyle}>2. Predictions are not carried forward (after the chosen horizon) so participants must update their predictions often to maximize their chances of prize. Only active predictions are considered for contest prizes.</p>
                        <p style={bulletStyle}>3. Each Participant can submit only 1 entry to the contest. Participant can submit as many predictions (based on virtual cash availability).</p>
                        <p style={bulletStyle}>4. Participant's entry must not violate or infringe on any applicable law or regulation or third-party rights.</p>
                        <p style={bulletStyle}>5. Participant's intellectual property will remain Participant's property; However, we may look at Participant's Investment Portfolio for additional checks. We WILL NOT used participant&rsquo;s stock predictions without explicit consent. We WILL NEVER distribute participant&rsquo;s stock predictions to general public.</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Scoring </h3>
                        <p><strong>The contest is designed to award stock pickers that generate profits. As we award prizes on three different horizon, we will use three different scoring methods to select winners.</strong></p>
                        <p><strong>DAILY WINNERS: </strong>At the end of each trading day, ONLY active predictions on that date are considered and participant's&nbsp; profit/loss (%) is calculated. The top 3 winners will get Rs 100 each.</p>
                        <p><strong>WEEKLY WINNERS: </strong>At the end of each trading week, we will calculate the change in NET VALUE from last week's net value. The top 3 winners will get Rs.500, Rs, 300. Rs 200 respectively.</p>
                        <p><strong>MONTHLY WINNERS: </strong>At the end of each trading month, we will calculate the change in NET VALUE from end of last month's net value. All applicable* winners will get 10% of the profit generated over the benchmark. However, ONLY a maximum of Rs. 25000 will be awarded as prize money. The prizes will be awarded in order of decreasing profitability. Additionally, a high water mark (ending NAV must be greater than NAV of all previus months) test will be applicable to avoid double incentive.</p>
                        <p>&nbsp;</p>
                        <p><strong>Positive PnL Requirement</strong>: Only net profitable predictions/portfolios are considered for evaluation and any award. For ex: If active predictions or Portfolio&rsquo;s profit sum to a NET LOSS, it is not eligible for any awards and prizes. In addition, there is a mimumum profit threshold of minimum 0.5% for daily winners, 1% for weekly winners and 3% for monthly winners.</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Other Rules</h3>
                        <p style={bulletStyle}>1. Each Participant may have only one AdviceQube account. If the Participant submits entries from more than one account, all entries may be disqualified.</p>
                        <p>&nbsp;</p>
                        <h3 style={h3Style}>Reward Intimation and Disbursement</h3>
                        <p>AdviceQube will email winners at the end of each trading day. Daily/Weekly prizes will be disbursed on a weekly basis at the end of the week. Monthly prizes will be disbursed one week after the end of the trading month.</p>
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
                        <p>Last revised: 31st December 2018</p>
                        <p><br /><br /></p>
                    </div>
                </Grid>
                <Grid item xs={12} style={{marginTop: '30px'}}>
                    <Footer />
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 599px)"
                    render={() => {
                        return (
                            <AqLayout lightMode>
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