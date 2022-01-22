import React, { Component } from 'react';
import { withTranslation, TFunction } from 'react-i18next';
import { ProgressBar } from '@freecodecamp/react-bootstrap';
import { connect } from 'react-redux';
import ScrollableAnchor from 'react-scrollable-anchor';
import { bindActionCreators, Dispatch } from 'redux';
import { createSelector } from 'reselect';
import { SuperBlocks } from '../../../../../config/certification-settings';
import envData from '../../../../../config/env.json';
import { isAuditedCert } from '../../../../../utils/is-audited';
import Caret from '../../../assets/icons/caret';
import GreenNotCompleted from '../../../assets/icons/green-not-completed';
import GreenPass from '../../../assets/icons/green-pass';
import { Link, Spacer } from '../../../components/helpers';
import { completedChallengesSelector, executeGA } from '../../../redux';
import { ChallengeNode, CompletedChallenge } from '../../../redux/prop-types';
import { playTone } from '../../../utils/tone';
import { makeExpandedBlockSelector, toggleBlock } from '../redux';
import IsNewRespCert from '../../../utils/is-new-responsive-web-design-cert';
import Challenges from './challenges';

const { curriculumLocale } = envData;

const mapStateToProps = (
  state: unknown,
  ownProps: { blockDashedName: string } & unknown
) => {
  const expandedSelector = makeExpandedBlockSelector(ownProps.blockDashedName);

  return createSelector(
    expandedSelector,
    completedChallengesSelector,
    (isExpanded: boolean, completedChallenges: CompletedChallenge[]) => ({
      isExpanded,
      completedChallengeIds: completedChallenges.map(({ id }) => id)
    })
  )(state as Record<string, unknown>);
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ toggleBlock, executeGA }, dispatch);

interface BlockProps {
  blockDashedName: string;
  challenges: ChallengeNode[];
  completedChallengeIds: string[];
  executeGA: typeof executeGA;
  isExpanded: boolean;
  superBlock: SuperBlocks;
  t: TFunction;
  toggleBlock: typeof toggleBlock;
}

const mapIconStyle = { height: '15px', marginRight: '10px', width: '15px' };

export class Block extends Component<BlockProps> {
  static displayName: string;
  constructor(props: BlockProps) {
    super(props);

    this.handleBlockClick = this.handleBlockClick.bind(this);
  }

  handleBlockClick(): void {
    const { blockDashedName, toggleBlock, executeGA } = this.props;
    void playTone('block-toggle');
    executeGA({
      type: 'event',
      data: {
        category: 'Map Block Click',
        action: blockDashedName
      }
    });
    toggleBlock(blockDashedName);
  }

  renderCheckMark(isCompleted: boolean): JSX.Element {
    return isCompleted ? (
      <GreenPass style={mapIconStyle} />
    ) : (
      <GreenNotCompleted style={mapIconStyle} />
    );
  }

  renderBlockIntros(arr: string[]): JSX.Element {
    return (
      <div className='block-description'>
        {arr.map((str, i) => (
          <p dangerouslySetInnerHTML={{ __html: str }} key={i} />
        ))}
      </div>
    );
  }

  renderProgressBar(): JSX.Element {
    return <ProgressBar now={25} label={`${25}%`} />;
  }

  render(): JSX.Element {
    const {
      blockDashedName,
      completedChallengeIds,
      challenges,
      isExpanded,
      superBlock,
      t
    } = this.props;

    const isNewResponsiveWebDesign = IsNewRespCert(superBlock);

    let completedCount = 0;
    const challengesWithCompleted = challenges.map(({ challenge }) => {
      const { id } = challenge;
      const isCompleted = completedChallengeIds.some(
        (completedChallengeId: string) => completedChallengeId === id
      );
      if (isCompleted) {
        completedCount++;
      }
      return { ...challenge, isCompleted };
    });

    const isProjectBlock = challenges.some(({ challenge }) => {
      const isJsProject =
        challenge.order === 10 && challenge.challengeType === 5;

      const isOtherProject =
        challenge.challengeType === 3 ||
        challenge.challengeType === 4 ||
        challenge.challengeType === 10;

      const isTakeHomeProject = blockDashedName === 'take-home-projects';

      return (
        (isJsProject && !isTakeHomeProject) ||
        (isOtherProject && !isTakeHomeProject)
      );
    });

    const blockIntroObj: { title?: string; intro: string[] } = t(
      `intro:${superBlock}.blocks.${blockDashedName}`
    );
    const blockTitle = blockIntroObj ? blockIntroObj.title : null;
    const blockIntroArr = blockIntroObj ? blockIntroObj.intro : [];
    const {
      expand: expandText,
      collapse: collapseText
    }: {
      expand: string;
      collapse: string;
    } = t('intro:misc-text');

    const ProjectBlock = (
      <>
        <ScrollableAnchor id={blockDashedName}>
          <div className='block'>
            <div className='block-header'>
              <a className='block-link' href={`#${blockDashedName}`}>
                <span className='cert-tag'>Certification Project</span>
                <h3 className='big-block-title'>
                  {blockTitle}
                  <span className='block-link-icon'>#</span>
                </h3>
              </a>
              {!isAuditedCert(curriculumLocale, superBlock) && (
                <div className='block-cta-wrapper'>
                  <Link
                    className='block-title-translation-cta'
                    to={t('links:help-translate-link-url')}
                  >
                    {t('misc.translation-pending')}
                  </Link>
                </div>
              )}
            </div>
            {this.renderBlockIntros(blockIntroArr)}
            <Challenges
              challengesWithCompleted={challengesWithCompleted}
              isProjectBlock={isProjectBlock}
              superBlock={superBlock}
            />
          </div>
        </ScrollableAnchor>
      </>
    );

    const Block = (
      <>
        {' '}
        <ScrollableAnchor id={blockDashedName}>
          <div className={`block ${isExpanded ? 'open' : ''}`}>
            <div className='block-header'>
              <a className='block-link' href={`#${blockDashedName}`}>
                <h3 className='big-block-title'>
                  {blockTitle}
                  <span className='block-link-icon'>#</span>
                </h3>
              </a>
              {!isAuditedCert(curriculumLocale, superBlock) && (
                <div className='block-cta-wrapper'>
                  <Link
                    className='block-title-translation-cta'
                    to={t('links:help-translate-link-url')}
                  >
                    {t('misc.translation-pending')}
                  </Link>
                </div>
              )}
            </div>
            {this.renderBlockIntros(blockIntroArr)}
            <button
              aria-expanded={isExpanded}
              className='map-title'
              onClick={() => {
                this.handleBlockClick();
              }}
            >
              <Caret />
              <h4 className='course-title'>
                {`${isExpanded ? collapseText : expandText}`}
              </h4>
              <div className='map-title-completed course-title'>
                {this.renderCheckMark(
                  completedCount === challengesWithCompleted.length
                )}
                <span className='map-completed-count'>{`${completedCount}/${challengesWithCompleted.length}`}</span>
              </div>
            </button>
            {isExpanded && (
              <Challenges
                challengesWithCompleted={challengesWithCompleted}
                isProjectBlock={isProjectBlock}
                superBlock={superBlock}
              />
            )}
          </div>
        </ScrollableAnchor>
      </>
    );
    const blockrenderer = () => {
      if (isProjectBlock) return ProjectBlock;
      return isNewResponsiveWebDesign ? AltBlock : Block;
    };

    const AltBlock = (
      <>
        {' '}
        <ScrollableAnchor id={blockDashedName}>
          <div className={`block block-grid ${isExpanded ? 'open' : ''}`}>
            <a
              className='block-header'
              onClick={() => {
                this.handleBlockClick();
              }}
              href={`#${blockDashedName}`}
            >
              <div className='title-wrapper map-title'>
                {this.renderCheckMark(
                  completedCount === challengesWithCompleted.length
                )}
                <h3>{blockTitle}</h3>
                <Caret />
              </div>
              {!isExpanded && (
                <div className='progress-wrapper'>
                  {this.renderProgressBar()}
                </div>
              )}
            </a>
            {isExpanded && (
              <>
                {this.renderBlockIntros(blockIntroArr)}
                <Challenges
                  challengesWithCompleted={challengesWithCompleted}
                  isProjectBlock={isProjectBlock}
                  superBlock={superBlock}
                />
              </>
            )}
          </div>
        </ScrollableAnchor>
      </>
    );

    return (
      <>
        {blockrenderer()}
        {isNewResponsiveWebDesign && !isProjectBlock ? null : <Spacer />}
      </>
    );
  }
}

// space if project block and new cert
// blockDashedName !== 'project-euler'

Block.displayName = 'Block';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Block));
