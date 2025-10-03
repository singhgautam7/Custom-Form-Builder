"use client"
import { useState } from 'react'
import {
  TextInput,
  Textarea,
  Accordion,
  Badge,
  Button,
  Group,
  Box,
} from '@mantine/core'
import { MdTitle, MdAlternateEmail, MdNumbers, MdList, MdStar, MdAdd } from 'react-icons/md'
import MantineProviderWrapper from './MantineProviderWrapper'

export default function FormBuilderPage({ onSave }) {
  // Form details state
  const [formTitle, setFormTitle] = useState('Customer Feedback Form')
  const [formDescription, setFormDescription] = useState(
    'Gather valuable insights from your customers with this comprehensive feedback form.'
  )

  // Static questions data representing your screenshot
  const questions = [
    { id: 1, type: 'text', icon: <MdTitle size={18} />, label: 'Your Name', required: true },
    { id: 2, type: 'email', icon: <MdAlternateEmail size={18} />, label: 'What aspects of our service did you find most satisfying?', required: false },
    { id: 3, type: 'number-scale', icon: <MdNumbers size={18} />, label: 'On a scale of 1-10, how likely are you to recommend us?', required: true },
    { id: 4, type: 'multi-select', icon: <MdList size={18} />, label: 'Which features are most important to you?', required: true },
    { id: 5, type: 'rating', icon: <MdStar size={18} />, label: 'How would you rate the ease of use?', required: true },
  ]

  return (
    <MantineProviderWrapper>
      <Box sx={{ maxWidth: 700, margin: 'auto', padding: '1rem' }} className="bg-white rounded-md shadow-md border border-gray-200">
      {/* Form Details Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Form Details</h2>

        <TextInput label="Form Title" placeholder="Form Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} className="mb-4" />
        <Textarea label="Form Description" placeholder="Form Description" minRows={3} value={formDescription} onChange={(e) => setFormDescription(e.currentTarget.value)} />
      </section>

      {/* Questions Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Questions</h2>

        <Accordion multiple variant="separated" chevronPosition="left" styles={{ item: { borderRadius: 6, borderColor: '#e5e7eb' } }}>
          {questions.map(({ id, label, icon, required }) => (
            <Accordion.Item key={id} value={String(id)}>
              <Accordion.Control className="flex items-center space-x-3">
                <div className="text-gray-500">{icon}</div>
                <span className="font-medium">{label}</span>
                {required && <Badge color="blue" size="sm" variant="light" className="ml-auto">Required</Badge>}
              </Accordion.Control>
              <Accordion.Panel>
                <p className="text-sm text-gray-600">Question details and editing UI go here.</p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      {/* Add New Question Button */}
      <div className="mt-6">
        <Button leftIcon={<MdAdd size={18} />} fullWidth color="blue" variant="filled" className="uppercase font-semibold tracking-wide">Add New Question</Button>
      </div>

      {/* Bottom action buttons */}
      <Group position="apart" className="mt-6">
        <Button variant="default">Save Draft</Button>
        <Button>Publish Form</Button>
      </Group>
      </Box>
    </MantineProviderWrapper>
  )
}
