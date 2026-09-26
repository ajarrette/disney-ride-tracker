import { Dimensions, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

export const rideLogFormStyles = StyleSheet.create({
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  formHeroImage: {
    height: 220,
    marginHorizontal: -24,
    width: Dimensions.get('window').width,
  },
  changeRideButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingVertical: 4,
  },
  changeRideText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rideTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },
  rideSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  dateTimeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    minHeight: 44,
  },
  dateTimeButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  lightningLaneButton: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  lightningLaneButtonPressed: {
    opacity: 0.72,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 24,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notesInput: {
    minHeight: 120,
  },
  photoHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    minHeight: 56,
  },
  photoLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  addPhotosButton: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1.5,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  addPhotosButtonPressed: {
    opacity: 0.72,
  },
  formPhotoStrip: {
    marginTop: 12,
  },
  saveFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
