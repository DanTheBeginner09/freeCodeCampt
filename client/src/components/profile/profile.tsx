import React, { useState } from 'react';
import Helmet from 'react-helmet';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Alert, Container, Modal, Row } from '@freecodecamp/ui';
import { connect } from 'react-redux';
import { FullWidthRow, Link, Spacer } from '../helpers';
import Portfolio from '../settings/portfolio';
import {
  submitNewAbout,
  updateMyPortfolio,
  updateMySocials
} from '../../redux/settings/actions';
import UsernameSettings from '../../components/settings/username';
import About from '../../components/settings/about';
import Internet, { Socials } from '../settings/internet';
import { User } from './../../redux/prop-types';
import Timeline from './components/time-line';
import Camper from './components/camper';
import Certifications from './components/certifications';
import Stats from './components/stats';
import HeatMap from './components/heat-map';
import { PortfolioProjects } from './components/portfolio-projects';

interface ProfileProps {
  isSessionUser: boolean;
  user: User;
  updateMyPortfolio: () => void;
  updateMySocials: (formValues: Socials) => void;
  submitNewAbout: () => void;
}

interface EditModalProps {
  user: User;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  updateMySocials: (formValues: Socials) => void;
  updateMyPortfolio: () => void;
  submitNewAbout: () => void;
}
interface MessageProps {
  isSessionUser: boolean;
  t: TFunction;
  username: string;
}

const mapDispatchToProps = {
  updateMyPortfolio,
  updateMySocials,
  submitNewAbout
};

const UserMessage = ({ t }: Pick<MessageProps, 't'>) => {
  return (
    <FullWidthRow>
      <Alert variant='info'>{t('profile.you-change-privacy')}</Alert>
      <Spacer size='medium' />
    </FullWidthRow>
  );
};

const EditModal = ({
  user,
  isEditing,
  setIsEditing,
  updateMyPortfolio,
  updateMySocials
}: EditModalProps) => {
  const {
    portfolio,
    username,
    about,
    location,
    name,
    picture,
    githubProfile,
    linkedin,
    twitter,
    website
  } = user;

  return (
    <Modal onClose={() => setIsEditing(false)} open={isEditing} size='xLarge'>
      <Modal.Header>Edit</Modal.Header>
      <Modal.Body>
        <UsernameSettings username={username} />
        <Spacer size='medium' />
        <About
          about={about}
          location={location}
          name={name}
          picture={picture}
          username={username}
          submitNewAbout={submitNewAbout}
          setIsEditing={setIsEditing}
        />
        <Spacer size='medium' />
        <Internet
          githubProfile={githubProfile}
          linkedin={linkedin}
          twitter={twitter}
          updateSocials={updateMySocials}
          website={website}
        />
        <Portfolio portfolio={portfolio} updatePortfolio={updateMyPortfolio} />
      </Modal.Body>
    </Modal>
  );
};

const VisitorMessage = ({
  t,
  username
}: Omit<MessageProps, 'isSessionUser'>) => {
  return (
    <FullWidthRow>
      <Alert variant='info'>
        {t('profile.username-change-privacy', { username })}
      </Alert>
      <Spacer size='medium' />
    </FullWidthRow>
  );
};

const Message = ({ isSessionUser, t, username }: MessageProps) => {
  if (isSessionUser) {
    return <UserMessage t={t} />;
  }
  return <VisitorMessage t={t} username={username} />;
};

function UserProfile({
  user,
  updateMyPortfolio,
  updateMySocials
}: ProfileProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);

  const {
    profileUI: {
      showAbout,
      showCerts,
      showDonation,
      showHeatMap,
      showLocation,
      showName,
      showPoints,
      showPortfolio,
      showTimeLine
    },
    calendar,
    completedChallenges,
    githubProfile,
    linkedin,
    twitter,
    website,
    name,
    username,
    joinDate,
    location,
    points,
    picture,
    portfolio,
    about,
    yearsTopContributor,
    isDonating
  } = user;

  return (
    <>
      <EditModal
        user={user}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        updateMyPortfolio={updateMyPortfolio}
        submitNewAbout={submitNewAbout}
        updateMySocials={updateMySocials}
      />
      <Camper
        about={showAbout ? about : ''}
        githubProfile={githubProfile}
        isDonating={showDonation ? isDonating : false}
        joinDate={showAbout ? joinDate : ''}
        linkedin={linkedin}
        location={showLocation ? location : ''}
        name={showName ? name : ''}
        picture={picture}
        twitter={twitter}
        username={username}
        website={website}
        yearsTopContributor={yearsTopContributor}
        setIsEditing={setIsEditing}
      />
      {showPoints ? <Stats points={points} calendar={calendar} /> : null}
      {showHeatMap ? <HeatMap calendar={calendar} /> : null}
      {showCerts ? <Certifications username={username} /> : null}
      {showPortfolio ? (
        <PortfolioProjects portfolioProjects={portfolio} />
      ) : null}
      {showTimeLine ? (
        <Timeline completedMap={completedChallenges} username={username} />
      ) : null}
      <Spacer size='medium' />
    </>
  );
}

function Profile({ user, isSessionUser }: ProfileProps): JSX.Element {
  const { t } = useTranslation();
  const {
    profileUI: { isLocked },
    username
  } = user;

  const showUserProfile = !isLocked || isSessionUser;

  return (
    <>
      <Helmet>
        <title>{t('buttons.profile')} | freeCodeCamp.org</title>
      </Helmet>
      <Spacer size='medium' />
      <Container>
        <Spacer size='medium' />
        {isLocked && (
          <Message username={username} isSessionUser={isSessionUser} t={t} />
        )}
        {showUserProfile && (
          <UserProfile
            user={user}
            isSessionUser={isSessionUser}
            updateMyPortfolio={updateMyPortfolio}
            updateMySocials={updateMySocials}
            submitNewAbout={submitNewAbout}
          />
        )}
        {!isSessionUser && (
          <Row className='text-center'>
            <Link to={`/user/${username}/report-user`}>
              {t('buttons.flag-user')}
            </Link>
          </Row>
        )}
        <Spacer size='medium' />
      </Container>
    </>
  );
}

Profile.displayName = 'Profile';

export default connect(null, mapDispatchToProps)(UserProfile);
