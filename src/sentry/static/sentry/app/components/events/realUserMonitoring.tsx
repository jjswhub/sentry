import React from 'react';
import styled from '@emotion/styled';

import {Organization, Event} from 'app/types';
import {IconSize} from 'app/utils/theme';
import {t} from 'app/locale';
import {SectionHeading} from 'app/components/charts/styles';
import {Panel} from 'app/components/panels';
import space from 'app/styles/space';
import Tooltip from 'app/components/tooltip';
import {IconFire} from 'app/icons';
import {
  WEB_VITAL_DETAILS,
  LONG_WEB_VITAL_NAMES,
} from 'app/views/performance/transactionVitals/constants';
import {formattedValue} from 'app/utils/measurements/index';

type Props = {
  organization: Organization;
  event: Event;
};
class RealUserMonitoring extends React.Component<Props> {
  hasMeasurements() {
    const {event} = this.props;

    if (!event.measurements) {
      return false;
    }

    return Object.keys(event.measurements).length > 0;
  }

  renderMeasurements() {
    const {event} = this.props;

    if (!event.measurements) {
      return null;
    }

    const measurementNames = Object.keys(event.measurements)
      .filter(name => {
        // ignore marker measurements
        return !name.startsWith('mark.');
      })
      .sort();

    return measurementNames.map(name => {
      const value = event.measurements![name].value;

      const record = Object.values(WEB_VITAL_DETAILS).find(vital => vital.slug === name);

      const failedThreshold = record ? value >= record.failureThreshold : false;

      const currentValue = formattedValue(record, value);
      const thresholdValue = formattedValue(record, record?.failureThreshold ?? 0);

      if (!LONG_WEB_VITAL_NAMES.hasOwnProperty(name)) {
        return null;
      }

      return (
        <div key={name}>
          <StyledPanel failedThreshold={failedThreshold}>
            <Name>{LONG_WEB_VITAL_NAMES[name] ?? name}</Name>
            <ValueRow>
              {failedThreshold ? (
                <WarningIconContainer size="sm">
                  <Tooltip
                    title={t('Fails threshold at %s.', thresholdValue)}
                    position="top"
                    containerDisplayMode="inline-block"
                  >
                    <IconFire size="sm" />
                  </Tooltip>
                </WarningIconContainer>
              ) : null}
              <Value failedThreshold={failedThreshold}>{currentValue}</Value>
            </ValueRow>
          </StyledPanel>
        </div>
      );
    });
  }

  render() {
    const {organization} = this.props;

    if (!organization.features.includes('measurements') || !this.hasMeasurements()) {
      return null;
    }

    return (
      <Container>
        <SectionHeading>{t('Web Vitals')}</SectionHeading>
        <Measurements>{this.renderMeasurements()}</Measurements>
      </Container>
    );
  }
}

const Measurements = styled('div')`
  display: grid;
  grid-column-gap: ${space(1)};
`;

const Container = styled('div')`
  color: ${p => p.theme.gray600};
  font-size: ${p => p.theme.fontSizeMedium};
  margin-bottom: ${space(4)};
`;

const StyledPanel = styled(Panel)<{failedThreshold: boolean}>`
  padding: ${space(1)} ${space(1.5)};
  margin-bottom: ${space(1)};

  ${p => {
    if (!p.failedThreshold) {
      return null;
    }

    return `
      border: 1px solid ${p.theme.red300};
    `;
  }};
`;

const Name = styled('div')``;

const ValueRow = styled('div')`
  display: flex;
  align-items: center;
`;

const WarningIconContainer = styled('span')<{size: IconSize | string}>`
  display: inline-block;
  height: ${p => p.theme.iconSizes[p.size] ?? p.size};
  line-height: ${p => p.theme.iconSizes[p.size] ?? p.size};
  margin-right: ${space(0.5)};
  color: ${p => p.theme.red300};
`;

const Value = styled('span')<{failedThreshold: boolean}>`
  font-size: ${p => p.theme.fontSizeExtraLarge};
  ${p => {
    if (!p.failedThreshold) {
      return null;
    }

    return `
      color: ${p.theme.red300};
    `;
  }};
`;

export default RealUserMonitoring;
